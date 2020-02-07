// inv square
// des îles moyennes avec parfois des reliefs en criques
// mais généralement des formes convexes et des côtes peu accidentées
// les îles les plus petites ont peu de hauts sommets
// une bonne alternative à l'identité

export default x => 1 - (x * 2 - 1) * (x * 2 - 1);