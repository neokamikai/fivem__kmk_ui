function isNaN(v)
    return type(v) == "number" and v ~= v
end

local currentStatus = {}

AddEventHandler('esx_status:onTick', function(data)
    for _, value in pairs(data) do
        currentStatus[value.name] = value
    end
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(500)
        local xPlayer = ESX.GetPlayerData()
        local playerId = PlayerPedId()
        while (not xPlayer.ped == playerId) do
            Citizen.Wait(1000)
        end
        local player = GetPlayerPed(playerId)
        -- local isAceAllowed = IsAceAllowed(char* object)
        -- local isPlayerMuted = MumbleIsPlayerMuted -- (playerId)
        local isVoipConnected = MumbleIsConnected()
        local voiceDistance = 'mid'
        local playerSrvId = GetPlayerServerId(player)
        local playerCoords = GetEntityCoords(playerId)
        local playerHeading = GetEntityHeading(playerId)
        local vehicle = GetVehiclePedIsIn(playerId, false)
        if (vehicle > 0) then
            local vehicleClass = GetVehicleClass(vehicle)
            local entitySpeed = GetEntitySpeed(vehicle)
            local vehicleEstimatedMaxSpeed = GetVehicleEstimatedMaxSpeed(vehicle)

            SendNuiMessage(json.encode({
                type = 'vehicle-info',
                vehicle = GetLiveryName(vehicle),
                bodyHealth = GetVehicleBodyHealth(vehicle),
                class = vehicleClass,
                estimatedMaxSpeed = GetVehicleClassEstimatedMaxSpeed(vehicleClass),
                passengers = GetVehicleMaxNumberOfPassengers(vehicle),
                mechanic = {
                    rpm = GetVehicleCurrentRpm(vehicle),
                    layoutHash = GetVehicleLayoutHash(vehicle)
                },
                alarm = {
                    activated = IsVehicleAlarmActivated(vehicle),
                    timeLeft = GetVehicleAlarmTimeLeft(vehicle)
                },
                dashboard = {
                    speed = GetVehicleDashboardSpeed(vehicle),
                    fuel = GetVehicleDashboardFuel(vehicle)
                },
                speed = {
                    estimatedMax = vehicleEstimatedMaxSpeed,
                    estimatedMaxKmPerHour = vehicleEstimatedMaxSpeed * 3.6,
                    -- modelEstimatedMax = GetVehicleModelEstimatedMaxSpeed(vehicle),
                    classEstimatedMax = GetVehicleClassEstimatedMaxSpeed(vehicleClass),
                    entitySpeed = entitySpeed,
                    kmPerHour = entitySpeed * 3.6,
                    milesPerHour = entitySpeed * 2.236936
                },
                oilLevel = GetVehicleOilLevel(vehicle),
                dirtLevel = GetVehicleDirtLevel(vehicle),
                fuelLevel = GetVehicleFuelLevel(vehicle),
                accel = GetVehicleAcceleration(vehicle),
                gear = GetVehicleCurrentGear(vehicle),
                lockStatus = GetVehicleDoorLockStatus(vehicle),
                petrolTankHealth = GetVehiclePetrolTankHealth(vehicle),
                wheels = GetVehicleNumberOfWheels(vehicle),
                engine = {
                    health = GetVehicleEngineHealth(vehicle),
                    temperature = GetVehicleEngineTemperature(vehicle),
                    running = GetIsVehicleEngineRunning(vehicle)
                },
                damaged = IsVehicleDamaged(vehicle),
                damageInfo = {
                    collided = HasEntityCollidedWithAnything(vehicle),
                    doors = {
                        [0] = IsVehicleDoorDamaged(vehicle, 0),
                        [1] = IsVehicleDoorDamaged(vehicle, 1),
                        [2] = IsVehicleDoorDamaged(vehicle, 2),
                        [3] = IsVehicleDoorDamaged(vehicle, 3),
                        [4] = IsVehicleDoorDamaged(vehicle, 4),
                        [5] = IsVehicleDoorDamaged(vehicle, 5),
                        [6] = IsVehicleDoorDamaged(vehicle, 6),
                        [7] = IsVehicleDoorDamaged(vehicle, 7),
                        [8] = IsVehicleDoorDamaged(vehicle, 8),
                        [9] = IsVehicleDoorDamaged(vehicle, 9)
                    },
                    window = {
                        [0] = not IsVehicleWindowIntact(vehicle, 0),
                        [1] = not IsVehicleWindowIntact(vehicle, 1),
                        [2] = not IsVehicleWindowIntact(vehicle, 2),
                        [3] = not IsVehicleWindowIntact(vehicle, 3),
                        [4] = not IsVehicleWindowIntact(vehicle, 4),
                        [5] = not IsVehicleWindowIntact(vehicle, 5)
                    },
                    tires = {
                        [0] = IsVehicleTyreBurst(vehicle, 0, true),
                        [1] = IsVehicleTyreBurst(vehicle, 1, true),
                        [2] = IsVehicleTyreBurst(vehicle, 2, true),
                        [3] = IsVehicleTyreBurst(vehicle, 3, true),
                        [4] = IsVehicleTyreBurst(vehicle, 4, true),
                        [5] = IsVehicleTyreBurst(vehicle, 5, true),
                        [45] = IsVehicleTyreBurst(vehicle, 45, true),
                        [47] = IsVehicleTyreBurst(vehicle, 47, true)
                    }
                },
                lights = {
                    lit = GetVehicleLightsState(vehicle, true, false),
                    highBeam = GetVehicleLightsState(vehicle, true, true),
                    interior = IsVehicleInteriorLightOn(vehicle)
                }
            }))
        end
        local currentPlayerHealth = GetEntityHealth(playerId)
        local maxPlayerHealth = GetEntityMaxHealth(playerId)
        local currentPlayerStamina = GetPlayerStamina(playerId)
        local maxPlayerStamina = GetPlayerMaxStamina(playerId)
        local staminaPercent = 100
        local currentPlayerArmour = GetPedArmour(playerId)
        local maxPlayerArmour = GetPlayerMaxArmour(playerId)
        -- local playerPing = GetPlayerPing(playerId)
        local playerName = GetPlayerName(playerId)
        local year --[[ integer ]], month --[[ integer ]], day --[[ integer ]], hour --[[ integer ]], minute --[[ integer ]],
        second --[[ integer ]] = GetLocalTime()
        if(maxPlayerStamina > 0) staminaPercent = currentPlayerStamina / maxPlayerStamina;

        SendNuiMessage(json.encode({
            type = 'update-player-info',
            inVehicle = vehicle,
            healthPercent = (currentPlayerHealth / maxPlayerHealth) * 100.0,
            playerId = xPlayer.uid or playerId,
            playerSrvId = playerSrvId,
            name = playerName,
            firstName = xPlayer.firstName,
            lastName = xPlayer.lastName,
            voiceDistance = voiceDistance,
            isVoipConnected = isVoipConnected,
            esx = xPlayer,
            status = currentStatus,
            stamina = {
                current = currentPlayerStamina,
                max = maxPlayerStamina,
                percent = staminaPercent
            },
            armor = {
                current = currentPlayerArmour,
                max = maxPlayerArmour
            },
            zone = {
                name = GetNameOfZone(playerCoords.x, playerCoords.y, playerCoords.z),
                street = GetStreetNameAtCoord(playerCoords.x, playerCoords.y, playerCoords.z)
            }
        }))
        SendNuiMessage(json.encode({
            type = 'position',
            x = playerCoords.x,
            y = playerCoords.y,
            z = playerCoords.z,
            heading = playerHeading
        }))
        SendNuiMessage(json.encode({
            year = year,
            month = month,
            day = day,
            hour = hour,
            minute = minute,
            second = second
        }))
    end
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)
        SendNuiMessage(json.encode({
            type = 'ping'
        }))
    end
end)

RegisterNuiCallback('pong', function(data, cb)
    cb(json.encode({
        acceptedPong = true
    }))
end)

RegisterNuiCallback('releaseNUIFocus', function(_, cb)
    cb('')
    setTeleportVisible(false)
end)

RegisterNuiCallback('teleport', function(data, cb)
    cb('')
    local playerId = PlayerPedId()
    local previousPos = GetEntityCoords(playerId)
    local previousHeading = GetEntityHeading(playerId)
    local posX = tonumber(tostring(data.x))
    local posY = tonumber(tostring(data.y))
    local posZ = tonumber(tostring(data.z))
    if ((isNaN(posX) or isNaN(posY) or isNaN(posZ))) then
        print('ops, deu ruim')
        return
    end
    SetEntityCoords(playerId, ToFloat(posX), ToFloat(posY), ToFloat(posZ))
    Wait(1000)
    local newPos = GetEntityCoords(playerId)
    print('from ' .. tostring(previousPos) .. ' to ' .. tostring(newPos) .. 'Params: (' .. posX .. ',' .. posY .. ',' ..
        posZ .. ')')
    if (data.heading ~= '') then
        SetEntityHeading(playerId, ToFloat(tonumber(tostring(data.heading))))
    end
    setTeleportVisible(false)
end)

function setTeleportVisible(visible)
    local type = 'open-teleporter'
    if (not visible) then
        type = 'close-teleporter'
    end
    SendNuiMessage(json.encode({
        type = type
    }))
    SetNuiFocus(visible, visible)
end

RegisterCommand('_showTeleporter', function()
    setTeleportVisible(true)
end)

RegisterKeyMapping('_showTeleporter', 'Show Teleporter', 'keyboard', 'F6')
