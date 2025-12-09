/**
 * 
 * converts given str_date to printable_format
 */
function formatDate(dateString: string): string {
    const date = new Date(dateString)

    const day = date.getDate()
    const month = date.toLocaleString("en-US", { month: "long" })
    const year = date.getFullYear()

    const suffix = 
        day % 10 === 1 && day !== 11 ? "st" :
        day % 10 === 2 && day !== 12 ? "nd" : 
        day % 10 === 3 && day !== 13 ? "rd" : "th";

        return `${day}${suffix} ${month}, ${year}`
}

export { formatDate }
