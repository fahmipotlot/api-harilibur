import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseHTML } from 'linkedom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getHTMLCalendar = async (year) => {
    const response = await fetch(`https://publicholidays.co.id/id/${year}-dates/`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
        }
    });
    if (!response.ok) {
        throw new Error(`An error has occured: ${response.status}`);
    }
    const text = await response.text();
    return text;
}

function zeroPad(num) {
    return (num.toString().length === 1) ? "0" + num : num;
}

async function getHolidayList(year) {
    try {
        let result = [];
        console.log(`Mengambil daftar hari libur tahun ${year}...`);
        await getHTMLCalendar(year).then((data) => {
            const { document } = parseHTML(data);
            let publicholidays = document.querySelector("tbody").closest("table.publicholidays");

            // Daftar hari libur
            let holidayList1 = publicholidays.querySelectorAll('tbody>tr.odd');
            let holidayList2 = publicholidays.querySelectorAll('tbody>tr.even');
            let holidayList = holidayList1.concat(holidayList2);

            Array.from(holidayList).forEach(e => {
                let td = e.querySelectorAll('td');
                let dates = td[0]?.textContent;
                let description = td[2]?.querySelector('a')?.textContent ?? td[2]?.querySelector('span')?.textContent;

                // exclude cuti
                if (! description.toLowerCase().includes('cuti')) {
                    // parse dates
                    let month = dates.split(" ")[1];
                    let date = dates.split(" ")[0];
                    switch (month) {
                        case "Januari": month = '01'; break;
                        case "Februari": month = '02'; break;
                        case "Maret": month = '03'; break;
                        case "April": month = '04'; break;
                        case "Mei": month = '05'; break;
                        case "Juni": month = '06'; break;
                        case "Juli": month = '07'; break;
                        case "Agustus": month = '08'; break;
                        case "September": month = '09'; break;
                        case "Oktober": month = '10'; break;
                        case "November": month = '11'; break;
                        case "Desember": month = '12'; break;
                    }

                    let item = {
                        holiday_dates: `${year}-${month}-${zeroPad(date)}`,
                        formatted_holiday_dates: new Date(`${year}-${month}-${zeroPad(date)}`),
                        holiday_name: description,
                        is_national_holiday: true
                    };

                    result.push(item);
                }
            });
        })

        // See: https://flaviocopes.com/how-to-sort-array-by-dates-javascript/
        const sortedResult = result.slice().sort((a, b) => b.formatted_holiday_dates - a.formatted_holiday_dates);
        for (const item of sortedResult) {
            delete item.formatted_holiday_dates;
        }

        fs.writeFile(outputFile, JSON.stringify(sortedResult), err => {
            if (err) {
                console.log(err);
            }
            console.log(`Berhasil menyimpan data daftar hari libur di tahun ${year}`);
        });
    } catch (error) {
        console.log(error);
    }
};

let year = (new Date()).getFullYear() + 2;
let myArgs = process.argv.slice(2);
if (myArgs.length > 0) {
    year = parseInt(myArgs[0]);
    if (isNaN(year)) {
        console.log('Yang Anda inputkan adalah bukan tahun!');
    } else if (year < 1900 || year > 3000) {
        console.log('Tahun yang diinputkan tidak boleh kurang dari 1900 atau lebih dari 3000!');
    }
}

const outputFile = path.join(__dirname, '..', 'data', `${year}.json`);

(async () => await getHolidayList(year))();
