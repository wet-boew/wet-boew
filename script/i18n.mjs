import { writeFileSync } from "fs";

const response = await fetch("https://docs.google.com/spreadsheets/d/1BmMrKN6Rtx-dwgPNEZD6AIAQdI4nNlyVVVCml0U594o/export?gid=1&format=csv");

const buffer = await response.arrayBuffer()

writeFileSync(`src/i18n/i18n.csv`, Buffer.from(buffer))
