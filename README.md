# EcoSync

Team name: BUET STORM'S END \
Instiution: Bangladesh University of Engineering and Technology \
Emails:
- tamimehsan99@gmail.com 
- sabit.jehadul.karim@gmail.com 
- hasanmasum1852@gmail.com 

## Quick Start

Before start make sure there is a osm.pbf file under valhalla/custom_files. If not then create folder if necessary and copy the pbf file in it. You can download from [here](https://drive.google.com/file/d/1Ht4EOjLbf9PhseEJEcieMdLDYvCOeqJ4/view?usp=sharing)

Credentials for presaved users

| Username           | Password | Role            |
|--------------------|----------|-----------------|
| admin              | 12345678 | SYSTEM_ADMIN    |
| sts_manager        | 12345678 | STS_MANAGER     |
| sts_manager1       | 12345678 | STS_MANAGER     |
| landfill_manager   | 12345678 | LANDFILL_MANAGER|
| landfill_manager1  | 12345678 | LANDFILL_MANAGER|


`sts_manager` has been assigned to a sts and `landfill_manager` has been assigned to a landfill. You can log in to them to use sts and landfill functionalites right away. 
And 4 vehicle has been assigned to the sts of the `sts_manager`.

\
To run the demo 
```
docker compose up
```
You can access the frontend from [localhost:3000](localhost:3000)

## Overview

### User and Role Management

#### User Management
- [x] User creation, update and delete
- [x] User list view
- [x] User role assignment
#### Authentication
- [x] Login, logout
- [x] Password reset and update
- [x] Confirm email

#### Role Based Access Control
- [x] Role creation, update and delete
- [x] Permission creation, update and delete
- [x] Assigning permission to role

#### Profile Management
- [x] Profile view
- [x] Profile Edit


## Data Entry Views

### System Admin

#### Vehicle management

- [x] Vehicle creation, update and delete
- [x] Vehicle assignment to sts

#### STS Management
- [x] STS create, update and delete
- [x] Assign manager to sts

#### Landfill Management
- [x] Landfill create, update and delete
- [x] Assiggn manager to landfill

## Billing View:

- [x] Generate bill based on vehicle, distance and load
- [x] Generate PDF slip of bill generated


## Route Optimization

- [x] Generate optimum landfill assignment based on distance 
- [x] Generate and display optimum route for trip

## Fleet Optimization
- [x] Suggest fleet based on given criteria
- [x] Confrim and generate trips for vehicles to optimize fleet

## Dashboard Statistics
- [x] Realtime(simulated) view of statistics of transportation, waste collection at site
- [x] Statistics of fuel consumption
