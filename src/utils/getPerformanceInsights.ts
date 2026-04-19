export const getPerformanceInsights = (
  stats: { avgBookingValue: number; customerRetention: number }) => {
  const insights = [];

  const growthText =
    stats.avgBookingValue > 150
      ? `Your average booking value is high ($${stats.avgBookingValue}). This indicates strong profitability per session.`
      : `Average booking value is $${stats.avgBookingValue}. Consider upselling sports drinks or equipment to increase revenue.`;

  insights.push({
    name: "Revenue Growth",
    description: growthText,
  });

  insights.push({
    name: "Peak Performance Times",
    description:
      "Weekends show 35% higher booking rates. Consider implementing dynamic pricing for peak hours to maximize yield.",
  });

  const retentionText =
    stats.customerRetention >= 50
      ? `${stats.customerRetention}% customer retention rate is excellent. Focus on loyalty programs to maintain this growth.`
      : `${stats.customerRetention}% retention rate is below target. Try offering 'Second Game' discounts to encourage repeat visits.`;

  insights.push({
    name: "Customer Retention",
    description: retentionText,
  });

  return insights;
};
