// @ts-ignore
var app = angular.module('kmkui', []);

app.controller('MainController', ['$scope', function MainController(scope) {
  const ctrl = this;
  ctrl.vehicleInfo = { name: 'test' };
  ctrl.playerInfo = {};
  ctrl.onOff = (value) => value ? 'on' : 'off';
  console.log(ctrl)
  window.addEventListener('message', (event) => {
    const data = event.data;


    switch (data.type) {
      case 'update-player-info':
        ctrl.playerInfo = data;
        break;
      case 'vehicle-info':
        ctrl.vehicleInfo = data;
        break;
      default:
        break;
    }
    scope.$apply();
  });
}]);

app.component('progressBarUi', {
  templateUrl: 'components/progress-bar.html',
  bindings: {
    barClass: '=',
    barStyle: '=',
    fillClass: '=',
    fillStyle: '=',
    value: '='
  },
  controller: ['$scope', function ProgressBarUIController(scope) {
    const ctrl = this;
    scope.$watch(function () {
      return angular.$$stringify([
        ctrl.fillStyle,
        ctrl.value,
      ]);
    }, function () {
      let progressValue = (typeof ctrl.value == 'number' && ctrl.value) || number;
      if (progressValue > 100) progressValue = 100;
      if (progressValue < 0) progressValue = 0;
      ctrl.computedFillStyle = {
        ...ctrl.fillStyle,
        width: `${progressValue}%`
      };
    })
  }]
})
app.component('speedgauge', {
  templateUrl: 'components/speed-gauge.html',
  controller: function ($scope) {
    const ctrl = this;
    const maxDeg = 179;
    ctrl.slices = [];
    const additionalSpeed = 80;
    const calculateNormalizedMaxSpeed = (maxSpeed) => {
      return maxSpeed + additionalSpeed - maxSpeed % 20;
    }
    ctrl.interval = 20;
    const makeNeedleTransform = (speed, maxSpeed) => `rotate(${speed / maxSpeed * maxDeg}deg)`
    ctrl.needleStyle = { transform: makeNeedleTransform(0, 1) };
    $scope.$watch('$ctrl.maxSpeed', (newMaxSpeed) => {
      if (typeof newMaxSpeed != 'number') return;
      const newSplices = [];
      const normalizedMaxSpeed = calculateNormalizedMaxSpeed(newMaxSpeed);// newMaxSepeed + 20 - newMaxSepeed % 20;
      if (normalizedMaxSpeed > 300) ctrl.interval = 40;
      if (normalizedMaxSpeed > 400) ctrl.interval = 60;
      if (normalizedMaxSpeed > 600) ctrl.interval = 80;
      if (normalizedMaxSpeed > 1000) ctrl.interval = 100;

      const makeSplice = (speed) => ({
        content: (speed % ctrl.interval === 0 && `${speed}`) || '',
        style: {
          transformOrigin: '100% 4px',
          transform: makeNeedleTransform(speed, normalizedMaxSpeed), // `rotate(${speed / normalizedMaxSpeed * maxDeg}deg)`,
          position: 'absolute',
          width: '100px',
          bottom: '4px'
        },
        needleStyle: {
          width: (speed % 20 === 0 && '12%') || '6%',
          backgroundColor: 'black',
          height: (speed % 20 === 0 && '3px') || '2px',
        },
        contentStyle: {
          height: '12px',
          fontSize: '8px',
          position: 'relative',
          textAlign: 'right',
          left: '12px',
          top: normalizedMaxSpeed === speed && '0px' || '-2px',
          // display: 'inline-block',
          //transformOrigin: '50% 4px',
          transformOrigin: '8px 4px',
          // width: '100px',
          // position: 'absolute',
          // bottom: '4px',
          transform: `rotate(-${speed / normalizedMaxSpeed * maxDeg}deg)`,
        }
      });
      for (let index = 0; index < normalizedMaxSpeed + 1; index += 10) {
        const element = makeSplice(index);
        newSplices.push(element);
      }
      ctrl.slices.splice(0, ctrl.slices.length);
      ctrl.slices.push(...newSplices);
    });
    $scope.$watch('$ctrl.speed', (newSpeed, previousSpeed) => {
      if (typeof ctrl.maxSpeed != 'number' || typeof ctrl.speed != 'number') return;
      ctrl.needleStyle = {
        transform: makeNeedleTransform(newSpeed, calculateNormalizedMaxSpeed(ctrl.maxSpeed)),
        transition: newSpeed > previousSpeed && 'all 1s linear' || newSpeed + previousSpeed === 0 && 'all 0.5s linear' || 'all 1.5s linear',
      };
    });
  },
  bindings: {
    speed: '=',
    maxSpeed: '='
  }
});

app.component('fuellevel', {
  bindings: { current: '=', max: '=' },
  controller: function ($scope) {
    const ctrl = this;
    ctrl.styles = {
      filled: {
        backgroundColor: 'orange',
        width: '100%',
        height: '100%',
        verticalAlign: 'middle',
        transformOrigin: '0 100%',
        position: 'relative',
        top: '0%',
        float: 'left',
      }
    };
    const updateFuelLevel = () => {
      if (typeof ctrl.value != 'number' || typeof ctrl.max != 'number' && ctrl.max <= 0) return;
      ctrl.styles.filled.top = `${((ctrl.value / ctrl.max) * 100).toFixed(0)}%`;
    }
    $scope.$watch('$ctrl.value', updateFuelLevel);
    $scope.$watch('$ctrl.max', updateFuelLevel);
  }
});

window.addEventListener('message', (event) => {
  const data = event.data;
  if (data.type === 'position') {
    const [positionX, positionY, positionZ, headingOutput] = [
      document.getElementById('position-x-output'),
      document.getElementById('position-y-output'),
      document.getElementById('position-z-output'),
      document.getElementById('heading-output'),
    ];
    if (positionX) positionX.innerText = `${(data.x).toFixed(3)}x`;
    if (positionY) positionY.innerText = `${(data.y).toFixed(3)}y`;
    if (positionZ) positionZ.innerText = `${(data.z).toFixed(3)}z`;
    if (headingOutput) headingOutput.innerText = data.heading.toFixed(0);
  }
  if (data.type === 'open-teleporter') {
    openTeleporter();
  }
  if (data.type === 'close-teleporter') {
    closeTeleporter();
  }
  if (data.type === 'update-player-info') {
    updatePlayerInfo(data);
  }
  // if (data.type === 'vehicle-info')
  //updateVehicleInfo(data)
});
const post = (event, data) => fetch(`https://${GetParentResourceName()}/${event}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=UTF-8' },
  body: JSON.stringify(data),
})
const btnTeleport = document.getElementById('btnTeleport');
const btnCancel = document.getElementById('btnCancel');

function doTeleport() {
  console.log('btnTeleport click')
  const [positionX, positionY, positionZ, headingInput] = [
    document.getElementById('teleporter_pos_x'),
    document.getElementById('teleporter_pos_y'),
    document.getElementById('teleporter_pos_z'),
    document.getElementById('teleporter_heading'),
  ];
  const postData = { x: 0, y: 0, z: 0, heading: '' };
  if (positionX && 'value' in positionX) postData.x = Number(positionX.value);
  if (positionY && 'value' in positionY) postData.y = Number(positionY.value);
  if (positionZ && 'value' in positionZ) postData.z = Number(positionZ.value);
  if (headingInput && 'value' in headingInput) postData.heading = `${headingInput.value}`;
  console.log('post teleport', postData)
  post('teleport', postData).then(resp => console.log(resp));

}
function doCancel() {
  console.log('cancel')
  post('releaseNUIFocus', {});
}

function openTeleporter() {
  document.getElementsByTagName('body')[0].classList.add('teleporter-open')
}
function closeTeleporter() {
  document.getElementsByTagName('body')[0].classList.remove('teleporter-open')
}
function updateHealth(amount) {
  const element = document.getElementById('healthBar');
  if (!element) return;
  element.style.width = amount + '%'
}
function setPlayerName(firstName, lastName) {
  const element = document.getElementById('playerName');
  if (!element) return;
  element.innerText = [firstName, lastName].join(' ');
}
function setPlayerId(playerId) {
  const element = document.getElementById('playerId');
  if (!element) return;
  element.innerText = playerId;
}
/**
 * 
 * @param {(element: HTMLElement) => any} callback 
 */
function elementCallback(elementId, callback) {
  if (elementId == 'body') {
    const bodyElement = document.getElementsByTagName('body').item(0);
    if (bodyElement) callback(bodyElement);
    return bodyElement;
  }
  const element = document.getElementById(elementId);
  if (!element) return;
  callback(element);
}
/**
 * 
 * @param {{
 * vehicle: string, accel: number, securityBelt: boolean,
 * lights: {lit:boolean, highBeam: boolean},
 * fuelLevel: number, damageLevel: number,
 * damageInfo: { collided: boolean },
 * mechanic: { rpm: number }
 * }} data 
 */
function updateVehicleInfo(data) {
  elementCallback('vehicleSpeed', (el) => { el.innerText = `${data.accel} ${data.mechanic.rpm}`; });
  elementCallback('vehicleLightsText', (el) => { el.innerText = data.lights.lit ? 'on' : 'off'; });
  elementCallback('vehicleLightsHBText', (el) => { el.innerText = data.lights.highBeam ? 'on' : 'off'; });
  elementCallback('vehicleBeltText', (el) => { el.innerText = data.securityBelt ? 'on' : 'off'; });
  elementCallback('vehicleName', (el) => { el.innerText = data.vehicle && `${data.vehicle}` || ''; });
  elementCallback('vehicleDamageText', (el) => { el.innerHTML = `<pre>${JSON.stringify(data.damageInfo, null, 2)}</pre>`; });
  elementCallback('vehicleFuelText', (el) => { el.innerText = `${data.fuelLevel}`; });
}
/**
 * 
 * @param {{ inVehicle: boolean, healthPercent: number, playerId: string, firstName: string, lastName: string }} data 
 */
function updatePlayerInfo(data) {
  const inVehicleClassName = 'vehicle-hud-visible';

  elementCallback('body', (el) => { if (Number(data.inVehicle) > 0) { el.classList.add(inVehicleClassName); } else { el.classList.remove(inVehicleClassName); }; });
  updateHealth(data.healthPercent);
  setPlayerId(data.playerId);
  setPlayerName(data.firstName, data.lastName);
}