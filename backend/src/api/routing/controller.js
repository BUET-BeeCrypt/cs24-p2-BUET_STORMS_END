const repository = require("./repository");
const modules = {};

const Valhalla = require("@routingjs/valhalla").Valhalla;

/**
 * 
 * @param {*} start - starting point with lat and lon
 * @param {*} end  - ending point with lat and lon
 * @returns route from start to end in json format 
 */

function wait(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

modules.endToEnd = async (start, end) => {
   try{
    const valhalla = new Valhalla();
    const result = await valhalla.directions(
        [
            [start.lat, start.lon],
            [end.lat, end.lon]
        ],
        "truck"
    )
    const feature = result.directions[0].feature;
    return feature;
   }catch(err){
        console.log(err);
       return null;
   }
}

modules.createRoutesFromLandfill = async (landfill_id) => {
    const landfill = await repository.getLandfill(landfill_id);
    if( landfill === null ) return;
    const STSs = await repository.getSTSs();
    for( const sts of STSs ){
        const result = await modules.endToEnd({lat:landfill.latitude, lon:landfill.longitude}, 
                                                {lat:sts.latitude, lon:sts.longitude});
        if( result !== null ){
            const direction = result.geometry.coordinates;
            const distance = result.properties.distance;
            const duration = result.properties.duration;
            await repository.createRoute(landfill_id, sts.sts_id, direction,distance,duration);
            console.log(`Route created from landfill ${landfill_id} to sts ${sts.sts_id}`);
        }
        await wait(1000);
    }
}

modules.createRoutesFromSTS = async (sts_id) => {
    const sts = await repository.getSTS(sts_id);
    if( sts === null ) return;
    const landfills = await repository.getLandfills();
    for( const landfill of landfills ){
        const result = await modules.endToEnd({lat:landfill.latitude, lon:landfill.longitude},
                                                {lat:sts.latitude, lon:sts.longitude});
        if( result !== null ){
            const direction = result.geometry.coordinates;
            const distance = result.properties.distance;
            const duration = result.properties.duration;
            await repository.createRoute(landfill.landfill_id, sts_id, direction,distance,duration);
            console.log(`Route created from landfill ${landfill.landfill_id} to sts ${sts_id}`);
        }
        await wait(1000);
    }
}

modules.createRouteFromLandfillToSTS = async (landfill_id, sts_id) => {
    const landfill = await repository.getLandfill(landfill_id);
    const sts = await repository.getSTS(sts_id);
    if( landfill === null || sts === null ) return;
    const result = await modules.endToEnd({lat:landfill.latitude, lon:landfill.longitude},
                                            {lat:sts.latitude, lon:sts.longitude});
    if( result !== null ){
        const direction = result.geometry.coordinates;
        const distance = result.properties.distance;
        const duration = result.properties.duration;
        await repository.createRoute(landfill_id, sts_id, direction,distance,duration);
        console.log(`Route created from landfill ${landfill_id} to sts ${sts_id}`);
    }
}

modules.assignSTSsToLandfills = async (req, res) => {
    const sts_id = req.params.sts_id;
    let routes = await repository.getRoutesBySTS(sts_id);
    const STSs = await repository.getSTSs();
    const landfills = await repository.getLandfills();
    let distances = {};
    for( const route of routes ){
        distances[route.landfill_id] = route.distance;
    }
    // checking if all assignment between landfill and sts is used
    let added = false;
    for( const landfill of landfills ){
       
        if( distances[landfill.landfill_id] === undefined ){
            console.log(`Creating route from landfill ${landfill.landfill_id} to sts ${sts_id}`);
            modules.createRouteFromLandfillToSTS(landfill.landfill_id, sts.sts_id);
            added = true;
            await wait(1000);
        }
        
    }

    if( added ){
        console.log("Routes added. Recalculating distances");
        routes = await repository.getRoutesBySTS();
    }
    
    let minDistance = Number.MAX_VALUE;
    let minLandfill = null;
    for( const route of routes ){
        if( route.distance < minDistance ){
            minDistance = route.distance;
            minLandfill = route;
        }
    }

    console.log(JSON.stringify(minLandfill));
    return res.status(200).json({message: "STSs assigned to landfills"});
}

module.exports = modules;