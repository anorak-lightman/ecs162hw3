ECS162HW3

To run this do the following commands in order:
Make sure you don't already have a container for this app started, if so delete the container before running any commands
1. docker-compose -f docker-compose.dev.yml up --build 
    * builds the container, should work without errors this time
2. follow the steps from discussion to set up your MongoDB database (do once)
3. in the mongo compass app hit the connection button
4. should be good now? Think I fixed all the errors hopefully