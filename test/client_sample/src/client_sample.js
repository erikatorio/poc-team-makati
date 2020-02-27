
const publicVapidKey = 'BIty5Q7aAdZPTB3th1Tqr9inm_hzHRhsUABOFiPPvqasfaRhtMNsO6MptziBoBvzuO5lDKuNCU7k-6zuVmnd1V4';

//check for service worker
if('serviceWorker' in navigator){
    send().catch(err => console.error(err));
}

//register SW, register push, send push
async function send(){
    //Register service worker
    console.log('Registering service worker...');
    const register = await navigator.serviceWorker.register('/worker.js', {
        scope: '/'
    });
    console.log('Service worker registered...');

    //register Push
    console.log('Registering Push...');
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Push registered...');

    //send Push
    console.log('Sending Push...');
    await fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers:{
            'content-type': 'application/json'
        }
    });
    console.log('Push sent...');

}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }