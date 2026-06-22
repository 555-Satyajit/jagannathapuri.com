const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function seedPanchang() {
  try {
    const filePath = path.join(__dirname, '../../clean_panchang_db.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const panchangData = JSON.parse(rawData);

    console.log(`Found ${panchangData.length} days of Panchang data. Formatting to match UI and importing...`);

    let count = 0;
    
    for (const day of panchangData) {
      const [dayStr, monthStr, yearStr] = day.date.split('/');
      const isoDate = new Date(`${yearStr}-${monthStr}-${dayStr}T00:00:00Z`);

      // Transform our clean JSON into the exactly what the Next.js Frontend expects
      const formattedData = {
        sections: [
          {
            title: "Sun & Moon",
            fields: [
              { label: "Sunrise", value: day.core.sunrise },
              { label: "Sunset", value: day.core.sunset }
            ]
          },
          {
            title: "Panchang Details",
            fields: [
              { label: "Tithi", value: day.core.tithi },
              { label: "Nakshatra", value: day.core.nakshatra },
              { label: "Moonsign", value: day.rashi_nakshatra.moonsign },
              { label: "Sunsign", value: day.rashi_nakshatra.sunsign },
              { label: "Nakshatra Pada", value: day.rashi_nakshatra.nakshatra_pada },
              { label: "Surya Nakshatra", value: day.rashi_nakshatra.surya_nakshatra }
            ]
          },
          {
            title: "Auspicious Timings",
            fields: [
              { label: "Brahma Muhurta", value: day.auspicious.brahma_muhurta },
              { label: "Pratah Sandhya", value: day.auspicious.pratah_sandhya },
              { label: "Abhijit", value: day.auspicious.abhijit },
              { label: "Vijaya Muhurta", value: day.auspicious.vijaya_muhurta },
              { label: "Godhuli Muhurta", value: day.auspicious.godhuli_muhurta },
              { label: "Sayahna Sandhya", value: day.auspicious.sayahna_sandhya },
              { label: "Amrit Kalam", value: day.auspicious.amrit_kalam }
            ]
          },
          {
            title: "Inauspicious Timings",
            fields: [
              { label: "Rahu Kalam", value: day.inauspicious.rahu_kalam },
              { label: "Yamaganda", value: day.inauspicious.yamaganda },
              { label: "Aadal Yoga", value: day.inauspicious.aadal_yoga },
              { label: "Dur Muhurtam", value: day.inauspicious.dur_muhurtam },
              { label: "Gulikai Kalam", value: day.inauspicious.gulikai_kalam },
              { label: "Varjyam", value: day.inauspicious.varjyam }
            ]
          }
        ]
      };

      await prisma.panchang.upsert({
        where: {
          date: isoDate
        },
        update: {
          data: formattedData
        },
        create: {
          date: isoDate,
          data: formattedData
        }
      });
      
      count++;
    }

    console.log(`✅ Successfully re-seeded ${count} days formatted for the Next.js UI!`);

  } catch (error) {
    console.error("❌ Error seeding Panchang data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedPanchang();
