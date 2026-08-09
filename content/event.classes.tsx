export const eventClasses: Record<string, Record<string, EventClass>> = {
    indoor: {
        losiNascar: {
            id: "losiNascar",
            name: "Losi NASCAR",
            icon: "fa-solid fa-flag-checkered",
            chipClass: "bg-red-600 text-white",
            rules: [ 
                {
                    type: "chassis",
                    rules: [
                        "Chassis must be in stock configuration.",
                        "Battery must be in stock location; Power switch may be moved.",
                        "All components on car must be used and un-modified including wiring, plugs, bodies, etc.",
                        "No lightening of any parts."
                    ]
                }, {
                    type: "electronics",
                    rule: "Stock electronics only. Including radio, servo, speed control & receiver."
                }, {
                    type: "gearing",
                    rule: "Stock gears only (59/19)"
                }, {
                    type: "suspension",
                    rules: [ 
                        "Shocks must move freely (I.E. not locked).", 
                        "Must use stock springs.", 
                        "Any shock oil may be used."
                    ]
                }, {
                    type: "differential",
                    rules: [
                        "Must use stock differential, Part #ARA31177V2.", 
                        "Differential must move freely (I.E. not locked).",
                        "No spools or locked differentials.",
                        "Any differential fluid may be used."
                    ]
                }, {
                    type: "heat-sink",
                    rules: [
                        "Motor heat sink is allowed for longevity.",
                        "Part #LOS-1920 is the only approved heat sink."
                    ]
                }, {
                    type: "tires",
                    rules: [
                        "Soft or medium compound rubber slicks allowed.",
                        "Rain tires, dirt tires, or foam tires are not allowed.",
                        "May glue of tape the right front tire.",
                        "Traction compound is allowed per track compound rules."
                    ]
                }, {
                    type: "bodies",
                    rules: [
                        "Any losi brand NASCAR car or truck body manufactured for the Losi NASCAR chassis may be used.",
                        "Bodies must be realistically painted, no clear bodies.",
                        "Bodies may not be modified or trimmed."
                    ]
                }, {
                    type: "battery",
                    rules: [
                        "Stock 1400mah 30c battery charged to 8.44v max.",
                        "Must have stock plug and wire length.",
                        "Must be charged with Specktrum Smart charger or equivalent."
                    ]
                }, {
                    type: "servo-horn",
                    rule: "Fixed, solid, or glued servo horn is allowed."
                }, {
                    type: "bearing",
                    rules: [
                        "Stock bearings preferred.",
                        "Will not disqualify for ceramic bearings due to difficulty of teching."
                    ]
                }
            ]
        },
        modLosiNascar: {
            id: "modLosiNascar",
            name: "Modified Losi NASCAR",
            icon: "fa-solid fa-flag-checkered",
            chipClass: "bg-red-600 text-white",
            rules: []
        },
        lateModelHackfab: {
            id: "lateModelHackfab",
            name: "Late Model Hackfab",
            icon: "fa-solid fa-car",
            chipClass: "bg-yellow-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rules: [
                        "Losi Mini-T 2.0 or Mini-B with HackFab Oval Conversion Kit.",
                        "Original Losi Mini Late Model also allowed.",
                        "Any chassis upgrades allowed.",
                        "Additional weight allowed."
                    ]
                }, {
                    type: "electronics",
                    rules: [
                        "Brushless Motor/ESC has a 5,000KV limit.",
                        "Hobbywing EZRun 18A ESC - Part #HWI81010020",
                        "Hobbywing Quicrun 2030SL G2 Motor; 5000KV only - Part #HWI30404800",
                        "ESC/Timing boost allowed.",
                        "Any micro/mini servo allowed.",
                        "Any radio system allowed excluding Gyro or AVC systems."
                    ]
                }, {
                    type: "battery",
                    rules: [
                        "Open 2s, 2,200MAH Limit (70c max).",
                        "Gens Ace 2s LiPo 60C (7.4v/2200mAh) allowed - Part #GEA2202S60X6",
                        "Powerhobby 2s LiPo 50c 2000mAg recommended - Part #PHB2s200050C",
                        "Gens Ace 2s LiPo 60c (7.4v/2200mAh) hardcase allowed - Part #GEA222s60X76GT",
                        "Stock 650mAh or 800mAh allowed."
                    ]
                }, {
                    type: "bodies",
                    rule: "McAllister Mini Late Model (Greenville/Batesville)"
                }, {
                    type: "tires",
                    rules: [
                        "BSR or Gone Bananas Foam Tires.",
                        "BSR tires work best trued down to ~52mm"
                    ]
                }, {
                    type: "suspension",
                    rule: "Any shocks/springs allowed, no restrictions."
                }, {
                    type: "gearing",
                    rule: "Any gearing allowed, including aftermarket pinion/spur gears."
                }
            ]
        },
        streetStock: {
            id: "streetStock",
            name: "Street Stock",
            hidden: true,
            icon: "fa-solid fa-road",
            chipClass: "bg-blue-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rule: "No adjustable rear arms."
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet tires or slicks may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate street stock bodies should be used."
                }, {
                    type: "battery",
                    rule: "No offset batteries are allowed.",
                }
            ]
        },
        lateModelBuggy: {
            id: "lateModelBuggy",
            name: "Late Model Buggy",
            hidden: true,
            icon: "fa-solid fa-car",
            chipClass: "bg-green-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rules: [
                        "Must be a buggy chassis. Offset chassis allowed.",
                        "No trucks, truggies, or other types allowed.",
                        "Adjustable rear arms are allowed."
                    ]
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet tires or slicks may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate late model bodies should be used."
                }
            ]
        },
        sprint360: {
            id: "sprint360",
            name: "360 Sprint",
            hidden: true,
            icon: "fa-solid fa-rocket",
            chipClass: "bg-pink-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rule: "No adjustable rear arms."
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet tires or slicks may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate street stock bodies should be used."
                }, {
                    type: "battery",
                    rule: "No offset batteries are allowed.",
                }
            ],
        },
        sprint410: {
            id: "sprint410",
            name: "410 Sprint",
            hidden: true,
            icon: "fa-solid fa-rocket",
            chipClass: "bg-purple-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rules: [
                        "Must be a buggy chassis. Offset chassis allowed.",
                        "No trucks, truggies, or other types allowed.",
                        "Adjustable rear arms are allowed."
                    ]
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet tires or slicks may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate sprint bodies should be used."
                }
            ],
        },
    }, 
    outdoor: {
        losiNascar: {
            id: "losiNascar",
            name: "Losi NASCAR",
            icon: "fa-solid fa-flag-checkered",
            chipClass: "bg-red-600 text-white",
            rules: [ 
                {
                    type: "chassis",
                    rules: [
                        "Chassis must be in stock configuration.",
                        "Battery must be in stock location; Power switch may be moved.",
                        "All components on car must be used and un-modified including wiring, plugs, bodies, etc.",
                        "No lightening of any parts."
                    ]
                }, {
                    type: "electronics",
                    rule: "Stock electronics only. Including radio, servo, speed control & receiver."
                }, {
                    type: "gearing",
                    rule: "Stock gears only (59/19)"
                }, {
                    type: "suspension",
                    rules: [ 
                        "Shocks must move freely (I.E. not locked).", 
                        "Must use stock springs.", 
                        "Any shock oil may be used."
                    ]
                }, {
                    type: "differential",
                    rules: [
                        "Must use stock differential, Part #ARA31177V2.", 
                        "Differential must move freely (I.E. not locked).",
                        "No spools or locked differentials.",
                        "Any differential fluid may be used."
                    ]
                }, {
                    type: "heat-sink",
                    rules: [
                        "Motor heat sink is allowed for longevity.",
                        "Part #LOS-1920 is the only approved heat sink."
                    ]
                }, {
                    type: "tires",
                    rules: [
                        "Soft or medium compound rubber slicks allowed.",
                        "Rain tires, dirt tires, or foam tires are not allowed.",
                        "May glue of tape the right front tire.",
                        "Traction compound is allowed per track compound rules."
                    ]
                }, {
                    type: "bodies",
                    rules: [
                        "Any losi brand NASCAR car or truck body manufactured for the Losi NASCAR chassis may be used.",
                        "Bodies must be realistically painted, no clear bodies.",
                        "Bodies may not be modified or trimmed."
                    ]
                }, {
                    type: "battery",
                    rules: [
                        "Stock 1400mah 30c battery charged to 8.44v max.",
                        "Must have stock plug and wire length.",
                        "Must be charged with Specktrum Smart charger or equivalent."
                    ]
                }, {
                    type: "servo-horn",
                    rule: "Fixed, solid, or glued servo horn is allowed."
                }, {
                    type: "bearing",
                    rules: [
                        "Stock bearings preferred.",
                        "Will not disqualify for ceramic bearings due to difficulty of teching."
                    ]
                }
            ]
        },
        modLosiNascar: {
            id: "modLosiNascar",
            name: "Modified Losi NASCAR",
            icon: "fa-solid fa-flag-checkered",
            chipClass: "bg-red-600 text-white",
            rules: []
        },
        streetStock: {
            id: "streetStock",
            name: "Street Stock",
            icon: "fa-solid fa-road",
            chipClass: "bg-blue-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rule: "No adjustable rear arms."
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet tires or slicks may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate street stock bodies should be used."
                }, {
                    type: "battery",
                    rule: "No offset batteries are allowed.",
                }
            ]
        },
        lateModelBuggy: {
            id: "lateModelBuggy",
            name: "Late Model Buggy",
            icon: "fa-solid fa-car",
            chipClass: "bg-green-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rules: [
                        "Must be a buggy chassis. Offset chassis allowed.",
                        "No trucks, truggies, or other types allowed.",
                        "Adjustable rear arms are allowed."
                    ]
                }, {
                    type: "electronics",
                    rule: "Motor, ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet or dirt tires may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate late model bodies should be used."
                }
            ]
        },
        losiSprint: {
            id: "losiSprint",
            name: "Losi Sprint",
            icon: "fa-solid fa-rocket",
            chipClass: "bg-purple-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rule: "Box Stock Losi 360 sprint chassis only.",
                },
                {
                    type: "electronics",
                    rule: "Box stock electronics, including radio."
                }
            ]
        },
        sprint360: {
            id: "sprint360",
            name: "360 Sprint",
            icon: "fa-solid fa-rocket",
            chipClass: "bg-pink-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rule: "No adjustable rear arms."
                }, {
                    type: "electronics",
                    rule: "13.5 or equivalent motor only. ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet or dirt tires may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate street stock bodies should be used."
                }, {
                    type: "battery",
                    rule: "No offset batteries are allowed.",
                }
            ],
        },
        sprint410: {
            id: "sprint410",
            name: "410 Sprint",
            icon: "fa-solid fa-rocket",
            chipClass: "bg-purple-600 text-white",
            rules: [
                {
                    type: "chassis",
                    rules: [
                        "Must be a buggy chassis. Offset chassis allowed.",
                        "No trucks, truggies, or other types allowed.",
                        "Adjustable rear arms are allowed."
                    ]
                }, {
                    type: "electronics",
                    rule: "Motor, ESC, Servo and Receiver of choice."
                }, {
                    type: "tires",
                    rule: "Carpet or dirt tires may be used."
                }, {
                    type: "bodies",
                    rule: "Appropriate sprint bodies should be used."
                }
            ],
        },
        mtx: {
            id: "mtx",
            name: "Motorcross",
            icon: "fa-solid fa-motorcycle",
            chipClass: "bg-brown-600 text-white",
            rules: []
        },
        truck2wd: {
            id: "2wdTruck",
            name: "2WD Truck",
            icon: "fa-solid fa-truck-pickup",
            chipClass: "bg-gray-600 text-white",
            rules: []
        },
        truckPro: {
            id: "proTruck",
            name: "Pro Truck",
            icon: "fa-solid fa-truck-monster",
            chipClass: "bg-red-600 text-white",
            rules: []
        }, 
        buggyModified: {
            id: "buggyModified",
            name: "Modified Buggy",
            icon: "fa-solid fa-car",
            chipClass: "bg-green-600 text-white",
            rules: []
        }, 
        scModified: {
            id: "scModified",
            name: "Short Course Modified",
            icon: "fa-solid fa-truck-pickup",
            chipClass: "bg-blue-600 text-white",
            rules: []
        }
    }
}

export interface EventClass {
    id: string;
    name: string;
    rules?: EventClassRule[];
    icon: string;
    chipClass: string;
    image?: string;
    hidden?: boolean;
}

export type EventClassRule =
    | ({ type: string; rule: string; rules?: never })
    | ({ type: string; rules: string[]; rule?: never });