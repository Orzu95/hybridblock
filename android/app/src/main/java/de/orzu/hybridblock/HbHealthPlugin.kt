package de.orzu.hybridblock

import androidx.activity.result.ActivityResult
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseRoute
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.MenstruationFlowRecord
import androidx.health.connect.client.records.MenstruationPeriodRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.getcapacitor.JSArray
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.TotalCaloriesBurnedRecord
import androidx.health.connect.client.records.metadata.Device
import androidx.health.connect.client.records.metadata.Metadata
import androidx.health.connect.client.units.Energy
import androidx.health.connect.client.units.Length
import app.capgo.plugin.health.WorkoutType
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.ZoneId

/**
 * Schreibt in der App aufgezeichnete Trainings (Sitzung, Strecke, Puls, Distanz, Kalorien) in Health Connect.
 * Lesen läuft weiter über @capgo/capacitor-health.
 */
@CapacitorPlugin(name = "HbHealth")
class HbHealthPlugin : Plugin() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val contract = PermissionController.createRequestPermissionResultContract()
    private val routePerm = "android.permission.health.WRITE_EXERCISE_ROUTE"
    private val basePerms = setOf(
        HealthPermission.getWritePermission(ExerciseSessionRecord::class),
        HealthPermission.getWritePermission(HeartRateRecord::class),
        HealthPermission.getWritePermission(DistanceRecord::class),
        HealthPermission.getWritePermission(TotalCaloriesBurnedRecord::class)
    )
    private val allPerms get() = basePerms + routePerm

    private fun client(): HealthConnectClient? =
        if (HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE) HealthConnectClient.getOrCreate(context) else null

    private fun statusObj(granted: Set<String>): JSObject {
        val o = JSObject()
        o.put("session", granted.contains(HealthPermission.getWritePermission(ExerciseSessionRecord::class)))
        o.put("route", granted.contains(routePerm))
        o.put("heartRate", granted.contains(HealthPermission.getWritePermission(HeartRateRecord::class)))
        o.put("distance", granted.contains(HealthPermission.getWritePermission(DistanceRecord::class)))
        return o
    }

    @PluginMethod
    fun status(call: PluginCall) {
        val c = client() ?: run { call.resolve(statusObj(emptySet()).put("available", false)); return }
        scope.launch {
            try { call.resolve(statusObj(c.permissionController.getGrantedPermissions()).put("available", true)) }
            catch (e: Exception) { call.reject(e.message ?: "status_failed") }
        }
    }

    @PluginMethod
    fun requestWrite(call: PluginCall) {
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        scope.launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                if (granted.containsAll(allPerms)) { call.resolve(statusObj(granted).put("available", true)); return@launch }
                val intent = contract.createIntent(context, allPerms)
                startActivityForResult(call, intent, "onPermResult")
            } catch (e: Exception) { call.reject(e.message ?: "request_failed") }
        }
    }

    @ActivityCallback
    private fun onPermResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        scope.launch {
            try { call.resolve(statusObj(c.permissionController.getGrantedPermissions()).put("available", true)) }
            catch (e: Exception) { call.reject(e.message ?: "status_failed") }
        }
    }

    /**
     * Erwartet: type (Workout-Name wie in @capgo/capacitor-health, z. B. "running"), start, end (ms),
     * title, distance (m), kcal, route [[lat, lng, tMs, alt?, acc?]], hr [[tMs, bpm]].
     */
    @PluginMethod
    fun writeWorkout(call: PluginCall) {
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        val startMs = call.getLong("start") ?: run { call.reject("start_missing"); return }
        val endMs = call.getLong("end") ?: run { call.reject("end_missing"); return }
        val start = Instant.ofEpochMilli(startMs)
        val end = Instant.ofEpochMilli(endMs)
        if (!end.isAfter(start)) { call.reject("bad_range"); return }
        val zone = ZoneId.systemDefault().rules
        val so = zone.getOffset(start)
        val eo = zone.getOffset(end)
        val exType = WorkoutType.fromString(call.getString("type")) ?: ExerciseSessionRecord.EXERCISE_TYPE_OTHER_WORKOUT
        val title = call.getString("title")
        val dist = call.getDouble("distance")
        val kcal = call.getDouble("kcal")
        val routeArr = call.getArray("route")
        val hrArr = call.getArray("hr")
        scope.launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                if (!granted.contains(HealthPermission.getWritePermission(ExerciseSessionRecord::class))) { call.reject("no_permission"); return@launch }
                val meta = Metadata.activelyRecorded(Device(type = Device.TYPE_PHONE))
                var route: ExerciseRoute? = null
                if (granted.contains(routePerm) && routeArr != null && routeArr.length() > 1) {
                    val pts = ArrayList<ExerciseRoute.Location>()
                    for (i in 0 until routeArr.length()) {
                        val p = routeArr.getJSONArray(i)
                        val t = Instant.ofEpochMilli(p.getLong(2))
                        if (t.isBefore(start) || t.isAfter(end)) continue
                        val alt = if (p.length() > 3 && !p.isNull(3)) Length.meters(p.getDouble(3)) else null
                        val acc = if (p.length() > 4 && !p.isNull(4)) Length.meters(p.getDouble(4)) else null
                        pts.add(ExerciseRoute.Location(time = t, latitude = p.getDouble(0), longitude = p.getDouble(1), horizontalAccuracy = acc, altitude = alt))
                    }
                    if (pts.size > 1) route = ExerciseRoute(pts)
                }
                val records = ArrayList<Record>()
                records.add(ExerciseSessionRecord(startTime = start, startZoneOffset = so, endTime = end, endZoneOffset = eo, metadata = meta, exerciseType = exType, title = title, exerciseRoute = route))
                if (dist != null && dist > 0 && granted.contains(HealthPermission.getWritePermission(DistanceRecord::class)))
                    records.add(DistanceRecord(startTime = start, startZoneOffset = so, endTime = end, endZoneOffset = eo, distance = Length.meters(dist), metadata = Metadata.activelyRecorded(Device(type = Device.TYPE_PHONE))))
                if (kcal != null && kcal > 0 && granted.contains(HealthPermission.getWritePermission(TotalCaloriesBurnedRecord::class)))
                    records.add(TotalCaloriesBurnedRecord(startTime = start, startZoneOffset = so, endTime = end, endZoneOffset = eo, energy = Energy.kilocalories(kcal), metadata = Metadata.activelyRecorded(Device(type = Device.TYPE_PHONE))))
                if (hrArr != null && hrArr.length() > 0 && granted.contains(HealthPermission.getWritePermission(HeartRateRecord::class))) {
                    val samples = ArrayList<HeartRateRecord.Sample>()
                    for (i in 0 until hrArr.length()) {
                        val p = hrArr.getJSONArray(i)
                        val t = Instant.ofEpochMilli(p.getLong(0))
                        val bpm = p.getLong(1)
                        if (t.isBefore(start) || t.isAfter(end) || bpm < 25 || bpm > 250) continue
                        samples.add(HeartRateRecord.Sample(time = t, beatsPerMinute = bpm))
                    }
                    if (samples.isNotEmpty()) records.add(HeartRateRecord(startTime = start, startZoneOffset = so, endTime = end, endZoneOffset = eo, samples = samples, metadata = Metadata.activelyRecorded(Device(type = Device.TYPE_PHONE))))
                }
                val res = c.insertRecords(records)
                val o = JSObject()
                o.put("ok", true)
                o.put("ids", res.recordIdsList.size)
                o.put("route", route != null)
                call.resolve(o)
            } catch (e: Exception) { call.reject(e.message ?: "write_failed") }
        }
    }

    /* ---------- Zyklus lesen (Periode, Blutungsstärke) ---------- */
    private val cyclePerms = setOf(
        HealthPermission.getReadPermission(MenstruationPeriodRecord::class),
        HealthPermission.getReadPermission(MenstruationFlowRecord::class)
    )

    @PluginMethod
    fun requestCycle(call: PluginCall) {
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        scope.launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                if (granted.containsAll(cyclePerms)) { call.resolve(JSObject().put("granted", true)); return@launch }
                startActivityForResult(call, contract.createIntent(context, cyclePerms), "onCycleResult")
            } catch (e: Exception) { call.reject(e.message ?: "request_failed") }
        }
    }

    @ActivityCallback
    private fun onCycleResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        scope.launch {
            try { call.resolve(JSObject().put("granted", c.permissionController.getGrantedPermissions().containsAll(cyclePerms))) }
            catch (e: Exception) { call.reject(e.message ?: "status_failed") }
        }
    }

    /** start, end in ms. Ergebnis: periods [[startMs, endMs, quelle]], flows [[ms, stärke 0–3, quelle]] */
    @PluginMethod
    fun readCycle(call: PluginCall) {
        val c = client() ?: run { call.reject("health_connect_unavailable"); return }
        val start = Instant.ofEpochMilli(call.getLong("start") ?: (System.currentTimeMillis() - 200L * 86400000L))
        val end = Instant.ofEpochMilli(call.getLong("end") ?: System.currentTimeMillis())
        scope.launch {
            try {
                val granted = c.permissionController.getGrantedPermissions()
                val out = JSObject(); val periods = JSArray(); val flows = JSArray()
                if (granted.contains(HealthPermission.getReadPermission(MenstruationPeriodRecord::class))) {
                    val r = c.readRecords(ReadRecordsRequest(MenstruationPeriodRecord::class, TimeRangeFilter.between(start, end)))
                    r.records.forEach { x -> val a = JSArray(); a.put(x.startTime.toEpochMilli()); a.put(x.endTime.toEpochMilli()); a.put(x.metadata.dataOrigin.packageName); periods.put(a) }
                }
                if (granted.contains(HealthPermission.getReadPermission(MenstruationFlowRecord::class))) {
                    val r = c.readRecords(ReadRecordsRequest(MenstruationFlowRecord::class, TimeRangeFilter.between(start, end)))
                    r.records.forEach { x -> val a = JSArray(); a.put(x.time.toEpochMilli()); a.put(x.flow); a.put(x.metadata.dataOrigin.packageName); flows.put(a) }
                }
                out.put("periods", periods); out.put("flows", flows); out.put("granted", granted.containsAll(cyclePerms))
                call.resolve(out)
            } catch (e: Exception) { call.reject(e.message ?: "read_failed") }
        }
    }
}
