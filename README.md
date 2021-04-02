# Better Pull-A-Part Car Search
Hosted at: https://kevinle108.github.io/BetterPullAPart/

## Description:
A Pull-A-Part Search App that supports multiple cars of different makes!

This webapp was created mainly for me to have a better experience when having to search for cars a Pull-A-Part salvage yard. The issue I had with the car search on Pull-A-Part's website was that it only allows you to search multiple cars for the same make. For example, it will allow you to search for both Honda Civic and Honda Accord, but there is no way to search for both Honda Civic and Toyota Camry. Whenever I find myself going to Pull-A-Part, I often need to search cars of multiple makes. So I created this webapp that will allow users to search for cars of various makes and models and present their lot locations all in one sorted table. This makes my Pull-A-Part experience (and hopefully yours) a lot more efficient because you no longer need to pull up several different pages if you want to search for cars of multiple makes.

NOTE: At this time, the app only searches cars at Pull-A-Part's Louisville location.

## Code Louisville Javascript Project Requirements met:
- Retrieve data from an external API and display data in your app (such as with fetch() or with AJAX)
	- Make several fetch GET requests to get a list of all the makes and models available.
	- Makes a fetch POST request to search for a specific car when the ADD button is clicked.
- Create an array, dictionary or list, populate it with multiple values, retrieve at least one value, and use or display it in your application
	- Uses an array of objects to store all the search data and build a visual table with it.
- Visualize data in a graph, chart, or other visual representation of data
	- Displays the cars and which lot they are located in with a visual table
- Calculate and display data based on an external factor (ex: get the current date, and display how many days remaining until some event)
	- Calculates and displays the number of days the car on Pull-A-Part's yard (uses current date and car data obtained from API requests)

## Additional Features:
- Users can use the checkboxes next to each lot to help keep track of which cars they've visited as they make their way through the scrapyard.

## Known Issues:
- Sometimes an expanded dropdown menus will close prematurely. This might be due to the large number of the options in each select menu. 

## Special Thanks:
- Code Louisville (especially mentors Michael & Izaak) for the programming knowledge  
- Michael for showing me how to find the API calls, this project wouldn't have been possible without you!
- Han and Rick for helping me test and fix some issues with the application.
- https://www.pullapart.com/ for the original inspiration

## Author
Kevin Le
