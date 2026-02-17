/**
 * Interactive Global Services Map Logic
 * Uses AmCharts 5
 */

// -----------------------------------------------------------------------------
// 1. CONFIGURATION (User Editable)
// -----------------------------------------------------------------------------
const mapConfig = {
    "IN": {
        name: "India",
        color: "#2196f3", // Premium Blue
        hoverColor: "#42a5f5",
        services: [
            "Web Development",
            "App Development",
            "E-Commerce Development",
            "UI/UX Design",
            "Digital Marketing",
            "SEO"
        ],
        drillDownData: "india2019High",
        cities: [
            {
                name: "Bhubaneswar", // City Name
                details: "Main Branch", // Extra details
                latitude: 20.2961,
                longitude: 85.8245,
                color: "#ff0000" // Red for high visibility
            }
        ]
    }
};

const defaultColor = "#d1d5db"; // Light Grey
const defaultHoverColor = "#9ca3af"; // Medium Grey on hover
const strokeColor = "#ffffff"; // White borders

// -----------------------------------------------------------------------------
// 2. MAP INITIALIZATION
// -----------------------------------------------------------------------------
am5.ready(function () {

    // Create root element
    var root = am5.Root.new("chartdiv");

    // Set themes
    root.setThemes([
        am5themes_Animated.new(root)
    ]);

    // Create the map chart
    var chart = root.container.children.push(am5map.MapChart.new(root, {
        panX: "none", // Prevent panning to keep map static
        panY: "none",
        wheelY: "none", // Disable wheel zoom (scrolling page won't zoom map)
        wheelX: "none",
        projection: am5map.geoMercator(),
        homeZoomLevel: 1,
        homeGeoPoint: { longitude: 10, latitude: 15 } // Center roughly
    }));

    // Back button logic
    const backButton = document.getElementById('back-button');
    backButton.addEventListener('click', function () {
        chart.goHome(); // Zoom out
        homeSeries.show(); // Show world
        countrySeries.hide(); // Hide country details
        // Do NOT hide citySeries, keep it visible
        backButton.style.display = "none";
    });

    // -------------------------------------------------------------------------
    // 3. SERIES: WORLD MAP
    // -------------------------------------------------------------------------
    var homeSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"] // Exclude Antarctica
    }));

    homeSeries.mapPolygons.template.setAll({
        tooltipHTML: "{name}",
        interactive: true,
        fill: am5.color(defaultColor),
        stroke: am5.color(strokeColor),
        strokeWidth: 1,
        templateField: "polygonSettings"
    });

    // Hover state
    homeSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(defaultHoverColor)
    });

    // Color adapter for configured countries
    homeSeries.mapPolygons.template.adapters.add("fill", function (fill, target) {
        if (target.dataItem.dataContext && mapConfig[target.dataItem.dataContext.id]) {
            return am5.color(mapConfig[target.dataItem.dataContext.id].color);
        }
        return fill;
    });

    // Tooltip adapter for configured countries
    homeSeries.mapPolygons.template.adapters.add("tooltipHTML", function (tooltipHTML, target) {
        if (target.dataItem.dataContext && mapConfig[target.dataItem.dataContext.id]) {
            let config = mapConfig[target.dataItem.dataContext.id];
            let servicesList = config.services.map(s => `<li>• ${s}</li>`).join("");
            return `
                <div style="padding: 10px; border-radius: 5px; background: rgba(0,0,0,0.8); color: white; min-width: 150px;">
                    <h3 style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.3); padding-bottom: 5px; font-size: 16px;">${config.name}</h3>
                    <div style="font-size: 12px; font-weight: bold; margin-bottom: 3px; color: #aaa;">OUR SERVICES:</div>
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
                        ${servicesList}
                    </ul>
                </div>
            `;
        }
        return `
            <div style="padding: 5px 10px; background: rgba(0,0,0,0.8); color: white; border-radius: 3px;">
                {name}
            </div>
        `;
    });

    // Click event for Drill-down
    homeSeries.mapPolygons.template.events.on("click", function (ev) {
        var dataItem = ev.target.dataItem;
        var id = dataItem.dataContext.id;
        var countryConfig = mapConfig[id];

        // Zoom ONLY if country is configured (like India)
        if (countryConfig) {
            chart.zoomToMapObject(ev.target);

            if (countryConfig.drillDownData) {
                var geodataVar = "am5geodata_" + countryConfig.drillDownData;
                if (window[geodataVar]) {
                    setTimeout(function () {
                        homeSeries.hide();
                        countrySeries.set("geoJSON", window[geodataVar]);
                        countrySeries.show();
                        backButton.style.display = "block";
                    }, 1000); // Wait for zoom animation
                } else {
                    console.warn(`Geodata ${geodataVar} not found.`);
                }
            }
        }
    });

    // -------------------------------------------------------------------------
    // 4. SERIES: COUNTRY DETAIL (Sub-map)
    // -------------------------------------------------------------------------
    var countrySeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
        visible: false
    }));

    countrySeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        interactive: true,
        fill: am5.color(defaultColor),
        stroke: am5.color(strokeColor),
        strokeWidth: 1
    });

    countrySeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(defaultHoverColor)
    });

    // -------------------------------------------------------------------------
    // 5. SERIES: CITIES (Markers)
    // -------------------------------------------------------------------------
    var citySeries = chart.series.push(am5map.MapPointSeries.new(root, {
        // visible: true // Default is true
    }));

    citySeries.bullets.push(function () {
        var circle = am5.Circle.new(root, {
            radius: 5,
            // tooltipText: "{title}", // Moved to mainCircle for better control
            cursorOverStyle: "pointer",
            strokeWidth: 2,
            stroke: am5.color(0xffffff)
        });

        // Pulse animation
        circle.animate({
            key: "radius",
            to: 12, // Increased pulse
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic),
            loops: Infinity
        });
        circle.animate({
            key: "opacity",
            to: 0,
            from: 1,
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic),
            loops: Infinity
        });

        // Actual visible circle (overlaying the animation)
        var mainCircle = am5.Circle.new(root, {
            radius: 6,
            tooltipHTML: "<div style='text-align: center; color: white;'><b>{title}</b><br><span style='font-size: 13px; opacity: 0.8;'>{details}</span></div>",
            fill: am5.color(0xffca28),
            stroke: am5.color(0xffffff),
            strokeWidth: 2
        });

        // Ensure tooltip background is appropriate
        mainCircle.set("tooltip", am5.Tooltip.new(root, {
            getFillFromSprite: false,
            autoTextColor: false
        }));
        mainCircle.get("tooltip").get("background").setAll({
            fill: am5.color(0x000000),
            fillOpacity: 0.8,
            strokeOpacity: 0
        });
        mainCircle.get("tooltip").label.setAll({
            fill: am5.color(0xffffff)
        });


        // Apply color from data context
        mainCircle.adapters.add("fill", function (fill, target) {
            if (target.dataItem.dataContext.color) {
                return am5.color(target.dataItem.dataContext.color);
            }
            return fill;
        });

        return am5.Bullet.new(root, {
            sprite: mainCircle
        });
    });

    // -------------------------------------------------------------------------
    // 6. INITIAL DATA LOAD (Apply immediately)
    // -------------------------------------------------------------------------
    var initialCityData = [];
    Object.keys(mapConfig).forEach(countryCode => {
        let config = mapConfig[countryCode];
        if (config.cities) {
            config.cities.forEach(city => {
                initialCityData.push({
                    geometry: { type: "Point", coordinates: [city.longitude, city.latitude] },
                    title: city.name,
                    details: city.details || "",
                    color: city.color,
                    countryId: countryCode
                });
            });
        }
    });

    // Set data immediately so it appears on World Map
    citySeries.data.setAll(initialCityData);

}); // end am5.ready
