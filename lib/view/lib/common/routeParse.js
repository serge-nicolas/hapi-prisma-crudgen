/**
 * convert /admin/User/editn to { model:"User", action: "edit"  } from schema /admin/:model/:action
 * @param {*} regexp 
 * @param {*} route as defined in window.location (type object) or hapi request.path (type string)
 * @returns 
 */
function pathToRegexp(regexp, route) {
    const objectparts = regexp.split("/").filter(part => !!part);
    const pathParts = typeof route === "string" ? route.split("/").filter(part => !!part) : route.pathname.split("/").filter(part => !!part);

    const pathModel = objectparts
        .filter(part => !!part)
        .map((key, index) => {
            if (key.includes(":")) {
                return { [key.replace(":", "")]: pathParts[index] }
            }
            return null;
        });

    let target = {};
    pathModel.filter(part => !!part).map(item => Object.assign(target, item));

    return target;
}

function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

export { pathToRegexp, parseQuery };