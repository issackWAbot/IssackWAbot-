module.exports = Array.from({length:210},(_,i)=>({
 q: `${i+1}. ${["Ballon d'Or 2023 dawng tu?","World Cup 2022 champion?","UCL 2024 winner?","PL record season?","GOAT?","Messi club thar?","Ronaldo goal 900?","Mbappe club thar?","Man City treble kum?","FIFA Best 2023?"][i%10]} (Football Q${i+1})`,
 options: [["Messi","Haaland","Mbappe","Ronaldo"],["Argentina","France","Brazil","Croatia"],["Real Madrid","Man City","Inter","Dortmund"],["Haaland 36","Salah 32","Shearer 34","Cole 34"],["Messi/Ronaldo","Pele","Maradona","Cruyff"],["Inter Miami","Barcelona","PSG","Man City"],["Yes 2024","No","800","1000"],["Real Madrid","PSG","Monaco","Barcelona"],["2023","2022","2024","2021"],["Messi","Haaland","Mbappe","Bellingham"]][i%10],
 answer: ["A","A","A","A","A","A"][i%10],
 explain: `Football Q${i+1}`,
 image: null
}));
