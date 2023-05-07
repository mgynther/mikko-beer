# Mikko Beer

Mikko Beer is a hobby, learning and showcase web app by Mikko Gynther. See `backend` and `frontend` directories for backend and frontend, and also how to run them for development purposes.

The goal of this project is readable, testable and elegant code (although we are not there yet). Scope will most likely be limited compared to real-world applications but I will try to address also issues beyond the scope of this project in interfaces and code comments in addition to this file.

Showcase aspect is mostly technical, not UX or business. While I try to make the UX work for me I fully acknowledge that hardcore beer entusiasts would require a much more fine grained review system, probably a revision model of beers etc. It's also worth pointing out I could use some existing app to keep track of my reviews. I find it, however, very rewarding to implement something specifically tailored to my needs. So combining hobby, learning and showcase interests leads to compromises but I believe in achieving a good result in all areas. Perfection is rarely worth chasing as it tends add complexity to make results worse in the end.

## Status

At the moment the code is in an early and partially rough state but in use. I'm eating my own dog food so to speak. In addition to missing interesting features (such as style relationship aware statistics) technical shortcuts have been taken to get a minimal usable set of features into use. Important future work includes:

* UX review and query efficiency including proper DB indices. Although it is worth mentioning that there will never be massive amounts of data in my DB so there's definitely no need to go crazy with performance fine tuning.
* E2E testing, at least essential use cases.
* SQL testing with larger data sets. At the moment backend tests can be considered smoke tests as data sets are very limited. For example pagination is not properly tested anywhere and filtering is not comprehensively tested either.
* Frontend unit testing. It will be interesting to see how RTK can be handled in tests. Options include at least wrapping & mocking/stubbing/faking and refactoring to avoid RTK in tests.
* Editing and deleting data in the frontend which is currently missing in most places. I may choose not to implement deleting data because I don't think I need it myself. Instead it's probably better to work on UX to make it very unlikely to accidentally create duplicate data. DB constraints should prevent exact duplicates by and large but logical duplicates are possible.
* New views that support showing relevant data.
* Re-calculating password hash on login which enables adding cryptographic complexity meaning improving security in the future. While this may be overkill considering the value of data in DB it's nevertheless an interesting technical security improvement.
* Localization although I may opt out implementing it as I don't need other languages myself and localization implemented the way it is usually done is not an interesting challenge, much more like a chore honestly. Localization the way natural languages would require for great results meaning each localized string would involve a function for each language would be interesting but I don't see it happening in any real-world application as translators are not programmers at least in this day and age.

## User roles and rights

User roles, rights and data ownership model are very simplified. Basically admin creates data and viewer can see it. There is no concept of a user owning any data such as reviews. So the application does not really work for multiple users creating reviews etc unless deployments are user specific (which is essentially what I've done for myself). If the app was changed to support multiple users it would have to be decided which data would be shared and it would completely redefine the purpose of the application. For example reviews could be publicly visible providing a social aspect or private depending on what the intention of the app would be. As of now the app works for me and I have no interest in pursuing imaginary use cases. After all requests are authorized and authorization logic can be changed later if needed.

## Dependency choices and rationale

* Data is highly relational so a relational database is a very good fit. There is no ORM to hide problems until they are too bad to ignore and then it can be much more tedious to clean things up. SQL is the interface of RDBMS so I find it's usually a good idea to use it. Personally I don't find it too tedious to write migrations to create and alter tables etc and as I tried to point out it can be much more tedious after an ORM has generated something very different from what a developer expected.
* React and Redux are widely used and loved. RTK offers a lot and helps cut down boilerplate significantly. While there are other options available the selected set of frontend dependencies seems pretty robust all in all.
* There is no UI component framework on purpose. At work I've used a few and they are certainly not silver bullets although they offer a lot. A comprehensive framework such as Material UI easily takes over and will be a major pain on breaking API changes which they will do sooner or later. It's especially frustrating if the API is changed not necessarily for the better but just different. One option is to wrap the framework but it can be tedious too especially if the framework is comprehensively used. So I've decided to use pure HTML and CSS in this project at least for the time being. I've never seen a real frontend project that did not require heavy tweaking of styles of existing components so using the default building blocks and learning more CSS is useful. Also I'm not a UI/UX designer or particularly keen on aesthetics and I'm perfectly happy to use a UI that consists of basic buttons etc as long as they are used well and layouts enable good usability. As a developer I'm certainly biased and for me pretty things themselves are not very appealing and do not contribute to good UX a lot. Just to be clear, I'm not against using UI component frameworks in general. Projects are very different which should be reflected in deliberate dependency choices.

## Acknowledgements

Mikko Beer uses [Kysely](https://github.com/kysely-org/kysely) SQL-query builder and in fact the example app in Kysely repository served as a great backend starting point. My former colleague Sami Koskimäki is the main author of Kysely and knowing his expertise on ORMs and whatnot it was a no-brainer to check the project out. It was not a surprise that Kysely and its example app worked far better than any TypeScript Node backend template I could find.
