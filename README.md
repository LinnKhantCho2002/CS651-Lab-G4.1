# CS651 Exercise G4.1 — FriendlyEats

FriendlyEats is Google's restaurant recommendation codelab, completed with Firestore Native, anonymous Firebase Authentication, and a Node.js/Express server deployed on Google App Engine Standard.

Live application: https://friendlyeats-dot-cs651-n33-lcho-20261014.uw.r.appspot.com/

## Assignment and submission

Group assignment, due November 6, 2026 at 11:00 p.m. Pacific. Canvas lists 20 points and no additional instructions. The course outline requires three screenshots, prepared in `submissions/`:

1. `G4.1_App_Running.png`: live application with the GAE URL visible.
2. `G4.1_GAE_Deployment.png`: App Engine Console showing the deployed service/version.
3. `G4.1_Firestore_Data.png`: Firestore collection, documents, and stored fields.

Canvas: https://csueb.instructure.com/courses/57022/assignments/648336

Submitted for the group on November 6, 2026 at 1:39 p.m. Pacific, Attempt 1. Canvas confirmed "Submission sent" and listed all three PNGs. The live App Engine URL was included in a submission comment.

## Completed codelab functionality

- Create fictional sample restaurants in the `restaurants` collection.
- Read and render restaurants with a real-time snapshot listener.
- Open a restaurant and read its `ratings` subcollection.
- Filter by category, city, and price; sort by rating or review count.
- Save a review and update `numRatings` / `avgRating` in one Firestore transaction.
- Authenticate visitors anonymously and apply Firestore Security Rules.

The page keeps the original FriendlyEats layout. The Firebase SDK is bundled locally, and Express supports direct links to restaurant pages. App Check is an optional codelab extension and is not enabled.

## Cloud resources

| Resource | Value |
| --- | --- |
| Google Cloud project | `cs651-n33-lcho-20261014` |
| App Engine region | `us-west1` |
| App Engine service | `friendlyeats` |
| Active version | `g41-key-20261106b` |
| Runtime / instance class | Node.js 22 / F1 |
| Scaling | Automatic, minimum 0 / maximum 1 instance |
| Firestore database | `friendlyeats` — Native mode, `us-west1` |
| Collection | `restaurants` (20 sample documents) |
| Review subcollections | `restaurants/{restaurantId}/ratings` |

The project's existing `(default)` database is Datastore mode, so this exercise uses a separate named Native database. Existing App Engine `default` and `translate` services remain separate. Named databases have normal Firestore billing; this database does not receive the default database's free tier.

## Run locally

Requires Node.js 22 or newer and npm.

```sh
npm ci
cp public/firebase-config.example.js public/firebase-config.js
# Set the restricted browser API key in the ignored firebase-config.js file.
npm run build
npm run check
npm start
```

Open http://localhost:8080/. Local development connects to the real `friendlyeats` database using anonymous authentication, not an emulator. `public/firebase-config.js` is local deployment configuration and is excluded from Git. Configure it locally with an authorized, restricted Firebase browser API key before building or deploying. The key is restricted to the lab App Engine origin and localhost, and to Authentication, Token Service, and Firestore APIs. No API key or service-account credential is stored in this repository.

## Deploy

Authenticate with the project's authorized Google account:

```sh
gcloud auth login
gcloud services enable appengine.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com firebase.googleapis.com identitytoolkit.googleapis.com firebaserules.googleapis.com --project=cs651-n33-lcho-20261014
```

One-time setup already completed: Firebase was added to the existing project, a web app was registered, anonymous authentication was enabled, and the named Native database was created:

```sh
gcloud firestore databases create --database=friendlyeats --location=us-west1 --type=firestore-native --project=cs651-n33-lcho-20261014
```

For later rules/index changes, run `python3 scripts/deploy-firestore.py` from this directory. The helper uses the current gcloud session and publishes only this exercise's named database rules/indexes. The Firebase CLI can also use `firebase deploy --only firestore` with the checked-in `firebase.json` configuration. Wait for composite indexes to become READY before testing compound filters.

Build the browser bundle locally, then deploy it:

```sh
npm run build
npm run check
gcloud app deploy app.yaml --version=g41-key-20261106b --project=cs651-n33-lcho-20261014
gcloud app browse --service=friendlyeats --project=cs651-n33-lcho-20261014
```

`gcp-build` is explicitly empty so App Engine uses the prebuilt browser bundle. `.gcloudignore` excludes the root build helpers but includes `public/scripts/`. Health endpoint: `/api/health`.

## Validation and demonstration

Open the live app, select a restaurant, add a star rating and review, and reload the detail URL to confirm persistence. Use the filter bar to select a category, location, and price, then change the sort order.

Verified results are saved in `evidence/verification.json`. Validation covers the live application, persistent reviews, concurrent transaction aggregates, compound indexes, real-time updates, and Security Rules rejecting unauthenticated reads, restaurant renames, and invalid ratings. Sample restaurants and reviews are fictional demonstration data.

This is an educational codelab. Anonymous users can create sample restaurants and submit reviews; the rules validate fields and restrict updates, but it is not a production moderation or abuse-prevention system.

## Attribution

Based on Google's [Cloud Firestore Web Codelab](https://firebase.google.com/codelabs/firestore-web) and the `vanilla-js` starter in [firebase/friendlyeats-web](https://github.com/firebase/friendlyeats-web), upstream commit `0120c72661751d10374bb6e5a62bf094253f6409`. Google source headers and the Apache 2.0 license are retained. Local changes complete the codelab data functions, use the modular Firebase SDK with a named database, add error handling and accessible review controls, configure rules/indexes, and deploy the Node.js server on GAE instead of Firebase Hosting.

The browser also uses Material Components Web 0.39.3 (MIT), Navigo 6.0.2 (MIT), and the Firebase JavaScript SDK 13.2.0 (Apache 2.0). Bundled third-party license notices are retained.

Repository history was rewritten on November 6, 2026 to remove the previously committed Firebase configuration, and that API key was revoked. If you cloned the earlier history, use a fresh clone rather than merging the old commits back into this repository.
