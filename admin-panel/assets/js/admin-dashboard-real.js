/**
 * Admin Dashboard Real Data Init
 */

'use strict';

(function () {
    let cardColor, headingColor, labelColor, borderColor;

    if (isDarkStyle) {
        cardColor = config.colors_dark.cardColor;
        headingColor = config.colors_dark.headingColor;
        labelColor = config.colors_dark.textMuted;
        borderColor = config.colors_dark.borderColor;
    } else {
        cardColor = config.colors.white;
        headingColor = config.colors.headingColor;
        labelColor = config.colors.textMuted;
        borderColor = config.colors.borderColor;
    }

    // Revenue Growth Chart
    // --------------------------------------------------------------------
    const revenueGrowthChartEl = document.querySelector('#revenueGrowthChart');
    if (revenueGrowthChartEl) {
        const revenueGrowthChartConfig = {
            chart: {
                height: 170,
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    barHeight: '80%',
                    columnWidth: '50%',
                    startingShape: 'rounded',
                    endingShape: 'rounded',
                    borderRadius: 4,
                    distributed: true
                }
            },
            grid: {
                show: false,
                padding: {
                    top: -20,
                    bottom: -12,
                    left: -10,
                    right: 0
                }
            },
            colors: [
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors_label.primary,
                config.colors.primary,
                config.colors_label.primary,
                config.colors_label.primary
            ],
            dataLabels: {
                enabled: false,
            },
            series: [
                {
                    name: 'Revenue',
                    data: window.revenueChartData || []
                }
            ],
            legend: { show: false },
            xaxis: {
                categories: window.revenueChartLabels || [],
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    style: {
                        colors: labelColor,
                        fontSize: '13px'
                    }
                }
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return '₹' + val;
                    }
                }
            }
        };
        const revenueGrowthChart = new ApexCharts(revenueGrowthChartEl, revenueGrowthChartConfig);
        revenueGrowthChart.render();
    }

    // Weekly Order Summary Chart
    // --------------------------------------------------------------------
    const orderSummaryChartEl = document.querySelector('#orderSummaryChart');
    if (orderSummaryChartEl) {
        const orderSummaryChartConfig = {
            chart: {
                height: 230,
                type: 'area',
                toolbar: false,
                dropShadow: {
                    enabled: true,
                    top: 18,
                    left: 2,
                    blur: 3,
                    color: config.colors.primary,
                    opacity: 0.15
                }
            },
            markers: {
                size: 6,
                colors: 'transparent',
                strokeColors: 'transparent',
                strokeWidth: 4,
                hover: {
                    size: 7
                }
            },
            series: [
                {
                    data: window.weeklyOrderSummaryData || []
                }
            ],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                lineCap: 'round'
            },
            colors: [config.colors.primary],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.25,
                    stops: [0, 95, 100]
                }
            },
            grid: {
                show: true,
                borderColor: borderColor,
                padding: {
                    top: -15,
                    bottom: -10,
                    left: 15,
                    right: 10
                }
            },
            xaxis: {
                categories: window.weeklyOrderSummaryLabels || [],
                labels: {
                    offsetX: 0,
                    style: {
                        colors: labelColor,
                        fontSize: '13px'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                lines: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    offsetX: 7,
                    formatter: function (val) {
                        return '₹' + val;
                    },
                    style: {
                        fontSize: '13px',
                        colors: labelColor
                    }
                },
                min: 0,
                tickAmount: 4
            }
        };
        const orderSummaryChart = new ApexCharts(orderSummaryChartEl, orderSummaryChartConfig);
        orderSummaryChart.render();
    }

    // Order Status Overview (Visits Proxy - Donut Chart)
    // --------------------------------------------------------------------
    const visitsRadialChartEl = document.querySelector('#visitsRadialChart');
    if (visitsRadialChartEl) {
        const visitsRadialChartConfig = {
            chart: {
                height: 300,
                type: 'donut'
            },
            colors: [config.colors.success, config.colors.warning, config.colors.danger],
            series: window.orderStatusSeries || [0, 0, 0],
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            value: {
                                fontSize: '1.5rem',
                                fontFamily: 'Public Sans',
                                color: headingColor,
                                offsetY: -15,
                                formatter: function (val) {
                                    return parseInt(val) + '';
                                }
                            },
                            name: {
                                offsetY: 20,
                                fontFamily: 'Public Sans'
                            },
                            total: {
                                show: true,
                                label: 'Total Orders',
                                fontSize: '0.8rem',
                                color: labelColor,
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                }
                            }
                        }
                    }
                }
            },
            grid: {
                padding: {
                    top: 0,
                    bottom: 0
                }
            },
            stroke: {
                show: false,
                width: 0
            },
            dataLabels: {
                enabled: false
            },
            labels: window.orderStatusLabels || ['Completed', 'Pending', 'Failed'],
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                labels: {
                    colors: labelColor,
                    useSeriesColors: false
                }
            }
        };
        const visitsRadialChart = new ApexCharts(visitsRadialChartEl, visitsRadialChartConfig);
        visitsRadialChart.render();
    }
})();
