# Cornerstone Task
Store URL: https://test-store8084.mybigcommerce.com/
Preview Code: n4dcwdgm8o

## Overview
Overall I was able to complete all of the subtasks successfully. The biggest issue I encountered was that there were some things that were difficult to find right away within the documentation as well as the BigCommerce community forums, which ended up taking up a good chunk of time.

##### A quick overview of the tasks:
- When hovering over a product card, it brings in the second image and replaces the first one with it.
- The "Add All To Cart" and "Remove All Items" buttons are under the navbar links on desktop and above the sort select box on mobile.
- Both buttons get disable when they are clicked and show loading messages until the request has been completed.
- Both buttons show success/error notifications when the actions are completed.
- Customer details are shown in the navbar all the way to the left, opposite from the navbar links. If a currency selector is present, the user details will be shown to the right of the user details. 
- On mobile, customer details are shown are shown at the top of the hamburger menu.

For a more detailed description of how I implemented each feature, here is a little about my thought process with each subtask as well as issues I encountered, if any:

Here's a more detailed description of how I implemented the features, along with my though process as well as issues I encountered with each one, if any:

#### Show product's second image on hover:
When you hover over a product card, it replaces the current image with the second image if it is available and will still show the "Quick view", "Compare", and "Add to Cart" buttons that normally show if you hover over a product image. 

The second product image shows not only when you hover the image, but when you hover any part of the product card. Initially I implemented it as hovering over just the image, but decided that allowing the user to see the product even when hovering over the name would be better as it would allow the user the see the whole image, unobscured by the "Quick view" and other buttons that appear when you hover a product image. This issue could also have been solved by having the second image appear in a bubble when you hover it, but I decided against it as I felt having the second image replace the first one looked better, especially on mobile.

If no second image is available, it simply acts as it did before, showing just the buttons. 

####  "Add All To Cart" and "Remove All Items" buttons:
When deciding where to place the "Add All To Cart" and "Remove All Items" buttons I initially placed it under the nav links on both desktop and mobile. On mobile it didn't seem to me like it worked too well from a UI perspective and so I decided to put it above the sort select box for smaller screens. Another good option would have been to have the button be sticky and always be visible even when you're scrolled down past it, but I decided to keep it simple.

When it came to implementing the logic for these buttons, I had a bit of an issue with getting async and await to work. I believe it might have been a Babel issue but I wasn't able to figure it out so I just decided to work around it. I did that by having separate methods for each request that had to be made and essentially chaining them. It definitely wasn't the ideal way to it and not how I normally would have done it, but for the purposes of this task that's what I ended up doing. 

#### Customer details shown when user is logged in:
Instead of creating a separate banner for the user details, I just put them in the nav on the opposite end of the nav links. I kept it simple and just listed the name, email, and phone number. On smaller screens when the navbar collapses, the details can be found at the top of the mobile menu.

I think the desktop implementation doesn't quite look the best how it's implemented currently, just showing all the details by default. An improvement could be to have it just show the name and then have the rest of the details show in something similar to a dropdown when you either hover or click the name. This way the name would line up with the nav links and the navbar would look a little cleaner/more symmetrical.
