ECS162HW3

To run this do the following commands in order:
Make sure you don't already have a container for this app started, if so delete the container before running any commands
1. docker-compose -f docker-compose.dev.yml up --build 
    * builds the container, run this once and it should exit with a couple frontend and backend errors but we will fix those later
2. cd frontend
3. npm i
4. npm run dev -- --host 
    * at this point the frontend should be running and you can find it at localhost:5173
5. Open new terminal 
6. cd backend 
7. pip install --no-cache-dir -r requirements.txt
    * run once on initial set up
    * if you have an error later of not being able to find a library may need to run pip install manually for that package
8. python -m flask run --host=0.0.0.0 --port=8000 --reload --debug
    * your backend should now be able to connect to your frontend
9. follow the steps from discussion to set up your MongoDB database (do once)
10. in the mongo compass app hit the connection button
11. should be good now? Haven't found all the issues yet and if this starter code just worked like it should then all of this would be uncessary but unfortunately the starter code doesn't work