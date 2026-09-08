module.exports = Array.from({length:220},(_,i)=>({
 q: `${i+1}. ${["Tui chunga kal tu?","Isua pianna khua?","Baibul bung hmasa ber?","Noa lawng a ran?","Davida a that tu?","Israel hruai chhuak tu?","Isua zirtir zat?","Samsona chakna?","Jona awmna?","Paula tlukna khua?"][i%10]} (Bible Q${i+1})`,
 options: [["Petera","Johana","Mosia","Juda"],["Nazareth","Bethlehem","Jerusalem","Galili"],["Genesis","Exodus","Leviticus","Numbers"],["2","7","2 tinin","4"],["Goliatha","Saula","Solomona","Absaloma"],["Mosia","Abrahama","Davida","Elija"],["12","11","10","7"],["Sam","Keh","Hmul","Mit"],["Sangha pum","Thlalak","Lawng","Tui"],["Damaska","Jerusalem","Galili","Bethlehem"]][i%10],
 answer: ["A","B","A","C","A","A","A","C","A","A"][i%10],
 explain: `Bible Q${i+1} - Matthaia/Beginning`,
 image: null
}));
