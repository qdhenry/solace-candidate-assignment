# UI customizations:

- Added Mollie Glaston font for headlines
- Added Lato font for body text
- Added Solace green and gold colors
- Formatted table
- Added click to call
- Added search with debounce
- Styled page to be more consistent with Solace design language

# Usability improvements

- Added pagination
- Added sorting
- Added filtering

# Performance Improvements

- Added debouncing to search
- Added server side pagination

# Future Improvements

- componetize the AdvocateList table
- componetize the search functionality
- componetize the pagination functionality
- Add loading states
- Add error states and user readable error messages
- Apply state machine to search and pagination
- Convert specialties and degrees into enums for better type safety
- improve table design for mobile
- add image for advocates
- Add support for voice enabled search to support accessibility
- Add support for keyboard navigation to support accessibility

# Production platform observations

> While working on the take-home assignment, I felt that analyzing a similar
> feature on the live site could provide valuable inspiration, so I navigated to
> the “Find a Doctor or Facility” section at https://find.solace.health/. As I
> proceeded to step through the form, I uncovered a few bugs that I was felt
> compelled to document, troubleshoot, and brainstorm potential solutions for.

After dedicating about an hour to this bug investigation, I’ve decided to pause
my work on the take home assignment for now considering I had already spent
about 2 hours on the original take-home project. I have a bunch of additional
ideas that I would explore to enhance this type of search documented in the
DOCUMENT.md file within the code repository.

Though I understand reporting bugs found in the production site was not one of
my tasks, I hope you can understand why I decided to spend time on those issues.
I believe in addressing user-impacting bugs immediately; this type of bug takes
precedence over all other work for my team.

Thank you for your condideration —I look forward to where we go from here!

## Observations on Solace Website Functionality - onboarding steps within the "Find a Doctor or Facility" section

1. find.solace.health:

Production bug observation -
https://www.loom.com/share/0af9256ada6e4d36b17f03e5be87810b?sid=e9ac88ab-63ef-4798-85c6-31bf21835c4d

![generated-image-at-00:00:31](https://cdn.loom.com/sessions/picture-in-scripture/8bd4b1dad6564f5b8dca8f5a91c0ae71-31.jpg?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4ubG9vbS5jb20vc2Vzc2lvbnMvcGljdHVyZS1pbi1zY3JpcHR1cmUvOGJkNGIxZGFkNjU2NGY1YjhkY2E4ZjVhOTFjMGFlNzEtMzEuanBnIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzQ2ODkzODU5fX19XX0_&Key-Pair-Id=KQOSYIR44AIC0&Signature=anR6N5cq07vpB%7ES5aRKe3r7R6ecoa%7EzBeLQr-ZCiULv12T6Z8LmSHRYkY3WawY2uxFDu41d3-%7EniKrwwxTiwlBzWwjkSkELwRgs01Pj4Z%7EFrKJoOGjNq5imLe7XszrAuPzDSKERYwDn3S3w7YXqO2oWpWd6xhMlwsnD9DvJJ3srLDx3X4oHUvYCZHHDCq7Rrkp2Fkw82gXu8yfiJ3P4x9cSIw7fdDdUW8-%7EdfZLBky6HvqTFOnMolmtarz1f75%7E44e%7E1nJm-Eud3bYLqLsgDTyQXR5CT%7EvNSc%7EXYtJ-IjNiUnUSSygSg5Y9Fcd%7EWZxUjorHhM8xGRL7eduYLsdxg6g__)

## Description

The onboarding process is experiencing significant delays due to slow response
times from the location.json endpoint. This issue impacts user experience as it
prolongs the time taken to complete onboarding, potentially leading to user
frustration and drop-off.

## Steps to Reproduce

1. Initiate the onboarding process in the application.
2. Monitor the network requests in the console.
3. Locate the request to the location.json endpoint.
4. Measure the time taken for the response to be received after the request is
   sent.

## Acceptance Criteria

- The response time for the location.json endpoint should be reduced to under 2
  seconds.
- The root cause of the delay should be identified and documented.
- Any necessary code changes should be implemented and tested to ensure improved
  performance.

### Link to Loom

<https://loom.com/share/8bd4b1dad6564f5b8dca8f5a91c0ae71?src=composer>

location.json response took 14 seconds to return 147 line JSON payload?

Investigation -
https://www.loom.com/share/8bd4b1dad6564f5b8dca8f5a91c0ae71?sid=48a09063-463d-432c-8a4a-5602c60b295b

checking-insurance.json - timing out / retry behavior Potential root cause - The
database queries and transformations performed when the request hits the server?

# Back button behavior

![generated-image-at-00:01:39](https://cdn.loom.com/sessions/picture-in-scripture/e5089f351dce473188689260fce72393-99.jpg?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4ubG9vbS5jb20vc2Vzc2lvbnMvcGljdHVyZS1pbi1zY3JpcHR1cmUvZTUwODlmMzUxZGNlNDczMTg4Njg5MjYwZmNlNzIzOTMtOTkuanBnIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzQ2ODk0NzA0fX19XX0_&Key-Pair-Id=KQOSYIR44AIC0&Signature=YUpUbu5Av0vbwiSHUgZDf296v4ZziPbYZTFZujSx1CRxXk2PCEQ84eyCD4GkC9vRN0QV55rVNtYtZ79ZSonOhafWVSAQqQ%7E8UYzAjEa6jcSF0uKRlf0iFdFYIsXtpTI40adNbvHILpd5PuUSZ4oM0QYiI3ThY-MLSpS6OSDWxQu96f3Wpq3XfPBwnrub0cp3mL9l%7Ejhp53ieO4-JmLtvhoMc6p-Nj1rlH40BwpaVB8bF44crQ0e6snOqgwcUbcqJkqei8mgQXayRCPvlfGotjGBHteGGxun1sMRxNY81XapNYSxJBKvfiq2zmO%7EyWFqKaArx%7Ene61oHMxaXICuZOSQ__)

## Description

The back button functionality on the production site at find.solace.health does
not track the URL appropriately, leading to a loss of state information and a
poor user experience. When navigating back, users are not taken to the expected
previous step, and the URL does not reflect the current state of the
application.

## Steps to Reproduce

1. Navigate to the production site at find.solace.health.
2. Click on 'Get Started'.
3. Proceed through the steps until reaching the Medicare selection step.
4. Observe the URL in the address bar and note that it does not update correctly
   as you navigate through the steps.
5. Click the back button and observe the behavior of the application and the URL
   state.

## Acceptance Criteria

- The URL should accurately reflect the current step in the navigation process.
- When the back button is clicked, the user should be taken to the correct
  previous step with the appropriate state retained.
- State information should be preserved across navigation steps, potentially
  using query parameters to maintain state during refreshes.

### Link to Loom

<https://loom.com/share/e5089f351dce473188689260fce72393?src=composer>
https://www.loom.com/share/e5089f351dce473188689260fce72393?sid=29c60809-e79c-440a-b1da-b1ef7db3eb4b

Potential root cause: How the history/application is managed in the application
logic. While I can see the intention from the POV of the developer who may be
handling this feature, the resultant behavior could be a matter of
over-engineering. I'd ultimately want to discuss the decisions made with the
engineer and examine the potential of leaning more on browser-native history
tracking and parameterized paths.

Potential solution: As this is a key feature within the platform, its critical
that its behavior is well defined and very deterministic. I would want to ensure
that this entire onboarding flow is managed with a well defined, testable,
state-machine that will ensure that there is no opportunity to fall into the
states that are currently present in the onboarding flow.
