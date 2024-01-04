import axios from 'axios';

const getCourseData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Request Failed: ${error}`);
    }
}

const getSectionData = async (sectionIndex, url) => {
    const data = await getCourseData(url);
    let result = [];

    for (let classItem of data) {
        for (let section of classItem.sections) {
            if (String(section.index) === String(sectionIndex)) {
                result = [section.openStatus, classItem.title];
                break;
            }
        }
        if (result.length > 0) break;
    }

    if (result.length === 0) {
        console.log("Error");
        return undefined;
    }

    return result;
};

export { getSectionData };