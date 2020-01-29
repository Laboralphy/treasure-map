/**
 * Add a jQuery-like setter/getter to the object
 * @param oInstance {object}
 * @param sProperty {string} protected property name
 * @param value {string} if undefined, the method will act as a getter, else it will set the property
 * @return {*} oInstance, or value
 */
module.exports = function prop(oInstance, sProperty, value) {
    if (value === undefined) {
        return oInstance[sProperty];
    } else {
        oInstance[sProperty] = value;
        return oInstance;
    }
};
