const r = require.context('./', true, /\.json$/);
const m = {};
r.keys().forEach(file => {
    const key = file.match(/^\.\/(.+)\.json$/).pop();
    m[key] = r(file);
});
export default m;