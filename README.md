# Mikko Beer

Mikko Beer is a hobby, learning and showcase web app by Mikko Gynther. See `backend` and `frontend` directories for backend and frontend, and also how to run them for development purposes.

The goal of this project is readable, testable and elegant code (although we are not there yet). Scope will most likely be limited compared to real-world applications but I will try to address also issues beyond the scope of this project in interfaces and code comments.

At the moment the code is in very early and rough state but in use. In addition to missing features (such as statistics) plenty of technical shortcuts have been taken to get a minimum set of features into use. Important future work includes:

* Efficient queries that support (future) UX. Currently there's a fair amount of fetching all data to frontend, including but not limited to client side searches which will be replaced by server-side searches, more infinite scrolling etc.
* E2E testing, at least essential use cases.
* Frontend unit testing. It will be interesting to see how RTK can be handled. Options include at least wrapping & mocking/stubbing/faking and refactoring to avoid RTK in tests.
* Editing and deleting data in the frontend which is currently missing in most places.
* New views that support showing relevant data.
* Re-calculating password hash on login which enables adding cryptographic complexity meaning improving security in the future.

## Acknowledgements

Mikko Beer uses [Kysely](https://github.com/kysely-org/kysely) SQL-query builder and in fact the example app in Kysely repository served as a great backend starting point. My former colleague Sami Koskimäki is the main author of Kysely and knowing his expertise on ORMs and whatnot it was a no-brainer to check the project out. It was not a surprise that Kysely and its example app worked far better than any TypeScript Node backend template I could find.
