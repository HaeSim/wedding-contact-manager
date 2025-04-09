interface Contact {
  name: string
  phone: string
  contact: string
  intimacy: string
  group: string
  invited: boolean
}

export function parseCSV(csvText: string): Contact[] {
  // Split by lines and filter out empty lines
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    throw new Error("CSV file is empty")
  }

  const contacts: Contact[] = []

  // Process each line
  for (const line of lines) {
    // Split by comma or tab, handling quoted values
    const values = line.split(/[,\t]/).map((val) => val.trim())

    // Ensure we have at least name and phone
    if (values.length >= 2) {
      contacts.push({
        name: values[0] || "",
        phone: values[1] || "",
        contact: values[2] || "", // This might be empty in the provided format
        intimacy: values[2] || "", // In the provided format, intimacy is in the 3rd column
        group: values[3] || "", // In the provided format, group is in the 4th column
        invited: false, // Default to not invited
      })
    }
  }

  return contacts
}
