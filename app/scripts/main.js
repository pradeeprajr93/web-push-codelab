/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BOHJBjk66neYbAbNEQ2ZTRxLoOblM8J5kzdqxecj0B9Vc-fKXqGrM4a6QMC5dicx4kSUf0sTriN0x1pHd1kV1D0';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

if('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Yay! Service worker and push are supported!!')
  navigator.serviceWorker.register('sw.js')
  .then(
    swreg => {
      console.log('Service worker is registered!', swreg);
      swRegistration = swreg;
      intializeUI();
    }
  )
  .catch(
    error => {
      console.error('Service worker error', error);
    }
  )
} else {
  console.warn('Push messaging not supported.');
  pushButton.textContent = 'Push not supported';
}

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'Push Codelab';
  const options = {
    body: 'Yay it works.',
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  const notificationPromise = self.registration.showNotification(title, options);
  event.waitUntil(notificationPromise);
});

function updateBtn() {

  if(Notification.permission === 'denied') {
    pushButton.textContent = 'Push messaging Blocked';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if(isSubscribed) {
    pushButton.textContent = 'Disable Push Messaging';
  } else {
    pushButton.textContent = 'Enable Push Messaging';
  }
  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then((subscription) => {
    console.log('User is subscribed.');
    updateSubscriptionOnServer(subscription);
    isSubscribed = true;
    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function intializeUI() {

  pushButton.addEventListener('click', () => {
    pushButton.disabled = true;
    if(isSubscribed) {
      // TODO: Unsubscribe user
    } else {
      subscribeUser();
    }
  })

  // set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(
    subscription => {
      isSubscribed = !(subscription === null);
      if(isSubscribed) {
        console.log("User is subscribed.");
      } else {
        console.log('User is NOT subscribed.');
      }

      updateBtn();
    }
  )
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');

  if(subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription); 
    subscriptionDetails.classList.remove('is-invisible');
  } else {
    subscriptionDetails.classList.add('is-invisible');
  }

}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
