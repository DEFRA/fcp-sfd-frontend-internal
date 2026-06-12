/**
 * Takes the raw customer overview details data and maps it to a more usable format
 *
 * @param {Object} value - The data from the DAL
 *
 * @returns {Object} Formatted customer overview details data
 */

export const mapCustomerOverviewDetails = (value) => {
  const info = value?.customer?.info ?? {}
  const name = info?.name ?? {}

  return {
    info: {
      crn: value.customer.crn,
      customerName: `${name.first} ${name.last}`
    },
    businesses: business1()
  }
}

const business1 = () => {
  return [
    {
      name: 'Really Awesome Business',
      sbi: '483920157'
    },
    {
      name: 'Clarksons Farm',
      sbi: '917304826'
    },
    {
      name: 'Green Valley Organics',
      sbi: '560298341'
    },
    {
      name: 'Sunrise Dairy Co',
      sbi: '704915263'
    },
    {
      name: 'Oak Tree Produce',
      sbi: '392781604'
    },
    {
      name: 'Riverbank Livestock',
      sbi: '821640579'
    },
    {
      name: 'Meadowbrook Eggs',
      sbi: '649203718'
    },
    {
      name: 'Highfield Grains',
      sbi: '935817402'
    },
    {
      name: 'Stonebridge Orchards',
      sbi: '274691853'
    },
    {
      name: 'Willow and Sons Farming',
      sbi: '518304927'
    },
    {
      name: 'Rolling Hills Cattle',
      sbi: '760239184'
    },
    {
      name: 'Bluebell Pastures',
      sbi: '843105672'
    },
    {
      name: 'Harvest Moon Holdings',
      sbi: '296740315'
    },
    {
      name: 'Bright Acre Estates',
      sbi: '614928750'
    },
    {
      name: 'Golden Field Growers',
      sbi: '730461985'
    },
    {
      name: 'Foxglove Farm Partners',
      sbi: '405972618'
    },
    {
      name: 'Red Barn Produce',
      sbi: '982516407'
    },
    {
      name: 'Elmwood Grazing',
      sbi: '367184920'
    },
    {
      name: 'Hilltop Heritage Farms',
      sbi: '659740231'
    },
    {
      name: 'Autumn Ridge Crops',
      sbi: '140285973'
    },
    {
      name: 'North Meadow Dairy',
      sbi: '874620519'
    },
    {
      name: 'Westbrook Poultry',
      sbi: '523907641'
    },
    {
      name: 'Cedar Lane Farms',
      sbi: '711368294'
    },
    {
      name: 'Silver Birch Holdings',
      sbi: '248975360'
    },
    {
      name: 'Brookside Vegetables',
      sbi: '936204815'
    },
    {
      name: 'Little Acorn Farm',
      sbi: '485319762'
    },
    {
      name: 'Pinecrest Agriculture',
      sbi: '602784391'
    },
    {
      name: 'Greystone Livestock Ltd',
      sbi: '795461238'
    },
    {
      name: 'Far Horizon Farms',
      sbi: '319540826'
    },
    {
      name: 'Old Mill Croft',
      sbi: '857236104'
    },
    {
      name: 'Amberfield Growers',
      sbi: '462891375'
    },
    {
      name: 'Snowdrop Farm Services',
      sbi: '274603981'
    },
    {
      name: 'Wildflower Valley',
      sbi: '918250467'
    },
    {
      name: 'Maple Farm Enterprises',
      sbi: '543976210'
    },
    {
      name: 'Bramble Hedge Holdings',
      sbi: '680145329'
    },
    {
      name: 'Apple Gate Orchards',
      sbi: '327819540'
    },
    {
      name: 'Greenbrook Feeds',
      sbi: '769402185'
    },
    {
      name: 'Moorland Beef Co',
      sbi: '851637294'
    },
    {
      name: 'Valley View Holdings',
      sbi: '403918762'
    },
    {
      name: 'Rustic Field Collective',
      sbi: '296305874'
    },
    {
      name: 'Hawthorn Dairy Group',
      sbi: '672849130'
    },
    {
      name: 'Pebble Creek Farm',
      sbi: '915742603'
    },
    {
      name: 'Blacksmith Barn Produce',
      sbi: '538126749'
    },
    {
      name: 'Long Meadow Agri',
      sbi: '764510382'
    },
    {
      name: 'Eastwood Holdings',
      sbi: '280497615'
    },
    {
      name: 'Wheat and Wool Partners',
      sbi: '649138057'
    },
    {
      name: 'Sunny Acre Farms',
      sbi: '837604921'
    },
    {
      name: 'Fieldstone Organics',
      sbi: '514893760'
    },
    {
      name: 'Lavender Hill Produce',
      sbi: '391257846'
    },
    {
      name: 'Beacon Farm Group',
      sbi: '972046185'
    },
    {
      name: 'Morning Dew Crops',
      sbi: '208739451'
    },
    {
      name: 'Fernwood Grazing',
      sbi: '746180392'
    },
    {
      name: 'Blue Sky Agriculture',
      sbi: '581924763'
    },
    {
      name: 'Honeycomb Farm Ltd',
      sbi: '934617205'
    },
    {
      name: 'Quiet Valley Estates',
      sbi: '425730918'
    },
    {
      name: 'Mossy Lane Farms',
      sbi: '768294531'
    },
    {
      name: 'Lakeside Produce Co',
      sbi: '307615824'
    },
    {
      name: 'Elm Crest Dairy',
      sbi: '859372046'
    },
    {
      name: 'Rosewood Farm Partners',
      sbi: '612548790'
    },
    {
      name: 'Market Garden Collective',
      sbi: '490186327'
    },
    {
      name: 'Fresh Furrow Enterprises',
      sbi: '925304618'
    },
    {
      name: 'Kingsfield Farming',
      sbi: '374950281'
    },
    {
      name: 'River Glen Holdings',
      sbi: '786421503'
    },
    {
      name: 'Willowbrook Crop Care',
      sbi: '543208976'
    },
    {
      name: 'Mile End Farmhouse',
      sbi: '219647385'
    },
    {
      name: 'Clover Patch Farms',
      sbi: '869730154'
    },
    {
      name: 'Riverside Arable Ltd',
      sbi: '601592748'
    },
    {
      name: 'White Oak Holdings',
      sbi: '738415620'
    },
    {
      name: 'Green Lantern Farms',
      sbi: '482607193'
    },
    {
      name: 'Moor View Livestock',
      sbi: '957310462'
    },
    {
      name: 'Brightwater Produce',
      sbi: '325948617'
    },
    {
      name: 'Three Oaks Agriculture',
      sbi: '814206539'
    },
    {
      name: 'Golden Plough Farms',
      sbi: '690573284'
    },
    {
      name: 'Pleasant Pasture Co',
      sbi: '248761905'
    },
    {
      name: 'Hazelwood Orchard Group',
      sbi: '973824150'
    },
    {
      name: 'Silver Fern Farming',
      sbi: '506139872'
    },
    {
      name: 'Copper Kettle Farms',
      sbi: '742095631'
    },
    {
      name: 'Harbour Field Produce',
      sbi: '381670254'
    },
    {
      name: 'West Wind Agriculture',
      sbi: '826451907'
    },
    {
      name: 'New Barn Holdings',
      sbi: '614370829'
    },
    {
      name: 'Meadow View Farm Co',
      sbi: '297184653'
    },
    {
      name: 'Beech Lane Organics',
      sbi: '968253074'
    },
    {
      name: 'Kingsmoor Produce',
      sbi: '541807296'
    },
    {
      name: 'Pondside Livestock',
      sbi: '703962418'
    },
    {
      name: 'Hill and Hollow Farms',
      sbi: '452190763'
    },
    {
      name: 'Spring Gate Agriculture',
      sbi: '819540326'
    },
    {
      name: 'Brook Meadow Holdings',
      sbi: '364827195'
    },
    {
      name: 'Old Oak Farmstead',
      sbi: '976104582'
    },
    {
      name: 'Farmhouse Pantry Produce',
      sbi: '520739841'
    },
    {
      name: 'Sage and Soil Collective',
      sbi: '681245970'
    },
    {
      name: 'Starfield Farming Ltd',
      sbi: '238967451'
    },
    {
      name: 'Oak and Ivy Holdings',
      sbi: '847130265'
    },
    {
      name: 'Rolling River Produce',
      sbi: '590681324'
    },
    {
      name: 'Granary Gate Farms',
      sbi: '712459086'
    },
    {
      name: 'North Star Agri Group',
      sbi: '463820719'
    },
    {
      name: 'Golden Acre Dairy',
      sbi: '904716253'
    },
    {
      name: 'Ridgeway Crop Services',
      sbi: '356972140'
    },
    {
      name: 'Walnut Farm Enterprises',
      sbi: '685041932'
    },
    {
      name: 'Sunnybrook Holdings',
      sbi: '271634508'
    },
    {
      name: 'Orchard Lane Farming Co',
      sbi: '839257614'
    }
  ]
}

const formatBusinesses = (businesses) => {
  return businesses.map(business => ({
    name: business.name,
    sbi: business.sbi
  }))
}
