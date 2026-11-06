/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Each restaurant is a document; its reviews live in a ratings subcollection.
FriendlyEats.prototype.addRestaurant = function(data) {
  return F.addDoc(F.collection(F.db, 'restaurants'), data);
};

FriendlyEats.prototype.getAllRestaurants = function(renderer) {
  return this.getDocumentsInQuery(F.query(F.collection(F.db, 'restaurants'), F.orderBy('avgRating', 'desc'), F.limit(50)), renderer);
};

FriendlyEats.prototype.getDocumentsInQuery = function(query, renderer) {
  // Stop the old listener whenever the active list/filter changes.
  if (this.unsubscribeRestaurants) this.unsubscribeRestaurants();
  this.unsubscribeRestaurants = F.onSnapshot(query, function(snapshot) {
    if (snapshot.empty) return renderer.empty();
    // Rebuild in query order: a changed rating can move a restaurant in the list.
    var cards = document.querySelector('main #cards');
    if (!cards) { window.app.rerender(); return; }
    cards.replaceChildren();
    snapshot.forEach(function(doc) { renderer.display(doc); });
  }, this.showError.bind(this));
};

FriendlyEats.prototype.getRestaurant = function(id) {
  return F.getDoc(F.doc(F.db, 'restaurants', id)).then(function(doc) {
    if (!doc.exists()) throw new Error('This restaurant no longer exists.');
    return doc;
  });
};

FriendlyEats.prototype.getFilteredRestaurants = function(filters, renderer) {
  var query = F.collection(F.db, 'restaurants');
  if (filters.category && filters.category !== 'Any') query = F.query(query, F.where('category', '==', filters.category));
  if (filters.city && filters.city !== 'Any') query = F.query(query, F.where('city', '==', filters.city));
  if (filters.price && filters.price !== 'Any') query = F.query(query, F.where('price', '==', filters.price.length));
  query = F.query(query, F.orderBy(filters.sort === 'Reviews' ? 'numRatings' : 'avgRating', 'desc'), F.limit(50));
  return this.getDocumentsInQuery(query, renderer);
};

FriendlyEats.prototype.addRating = function(restaurantID, rating) {
  if (!Number.isInteger(rating.rating) || rating.rating < 1 || rating.rating > 5) {
    return Promise.reject(new Error('Choose a rating from 1 to 5 stars.'));
  }
  rating.text = String(rating.text || '').trim();
  if (!rating.text || rating.text.length > 2000) {
    return Promise.reject(new Error('Write a review of 1 to 2000 characters.'));
  }
  var restaurant = F.doc(F.db, 'restaurants', restaurantID);
  var review = F.doc(F.collection(restaurant, 'ratings'));
  // The review and aggregate must commit together, including concurrent reviews.
  return F.runTransaction(F.db, function(transaction) {
    return transaction.get(restaurant).then(function(doc) {
      if (!doc.exists()) throw new Error('Restaurant not found.');
      var data = doc.data();
      var count = data.numRatings + 1;
      transaction.update(restaurant, {
        numRatings: count,
        avgRating: (data.numRatings * data.avgRating + rating.rating) / count
      });
      transaction.set(review, rating);
    });
  });
};

FriendlyEats.prototype.showError = function(error) {
  console.error(error);
  var banner = document.getElementById('app-error');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'app-error';
    banner.setAttribute('role', 'alert');
    banner.style.cssText = 'position:fixed;bottom:16px;left:16px;right:16px;background:#9d2020;color:white;padding:18px;z-index:1000';
    document.body.append(banner);
  }
  banner.textContent = error.message || 'Unable to load Firestore data.';
};
