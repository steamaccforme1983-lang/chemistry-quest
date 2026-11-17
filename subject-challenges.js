'use strict';

const MATHS_CHALLENGE = [
 [0,'The roots of x² − 5x + 3 = 0 are a and b. Find a³ + b³.','80',['125','110','95'],'Use (a+b)³ − 3ab(a+b) = 125 − 45.'],
 [1,'The second and fifth terms of a geometric progression are 6 and 162. Find the sum of its first four terms.','80',['40','78','120'],'The ratio satisfies r³ = 27, so r = 3 and a = 2. The sum is 2 + 6 + 18 + 54.'],
 [2,'A 3 × 3 matrix A has determinant 4. What is det(2A⁻¹)?','2',['½','8','32'],'det(A⁻¹) = ¼. Multiplying all three rows by 2 scales the determinant by 8.'],
 [3,'A line through the centre of x² + y² − 6x + 4y − 3 = 0 cuts a chord. What is its length?','8',['4','16','2√13'],'The circle is (x − 3)² + (y + 2)² = 16. A chord through the centre is a diameter.'],
 [4,'A spherical balloon grows at 48π cm³/s. Find the rate of increase of its radius in cm/s when r = 3 cm.','4/3',['4','2/3','16/3'],'Differentiate V = 4πr³/3 to get 48π = 36π · dr/dt.'],
 [4,'A ladder 10 m long leans against a wall. Its foot moves away at 2 m/s. How fast is the top descending when the foot is 6 m from the wall?','1.5 m/s',['2 m/s','8/3 m/s','3 m/s'],'At x = 6, y = 8. Differentiate x² + y² = 100 to get dy/dt = −x(dx/dt)/y.'],
 [5,'Find the area enclosed by y = x and y = x².','1/6',['1/3','1/2','2/3'],'The curves meet at 0 and 1. Integrate x − x² over that interval.'],
 [5,'Evaluate ∫₀¹ x/(1 + x²) dx.','(ln 2)/2',['ln 2','½','π/4'],'Set u = 1 + x². Then du = 2x dx, and the new bounds are 1 and 2.'],
 [6,'Two balls are drawn without replacement from a bag with 5 red and 3 blue balls. Find the probability of one of each colour.','15/28',['15/64','5/14','3/8'],'There are 5 × 3 favourable unordered pairs out of C(8,2) = 28.'],
 [7,'If a = (1, 2) and b = (4, −2), find |a + 2b|².','85',['25','65','105'],'a + 2b = (9, −2), so its squared length is 81 + 4.']
];

const PHYSICS_CHALLENGE = [
 [3,'A glass slab is 21 cm thick. An inclusion appears 5 cm deep from one face and 9 cm deep from the opposite face. For near-normal viewing, find the refractive index.','1.50',['1.33','1.75','2.10'],'The two real depths add to the slab thickness. So n(5 + 9) = 21.'],
 [3,'A 60° prism has a minimum deviation of 30° in air. Find its refractive index.','√2',['√3','3/2','2'],'At minimum deviation, i = (A + δ)/2 = 45° and r = A/2 = 30°. Apply Snell’s law.'],
 [3,'A thin convex lens with n = 1.50 has focal length 20 cm in air. Find its focal length in water, whose refractive index is 4/3.','80 cm',['40 cm','60 cm','160 cm'],'Lens power scales with n(lens)/n(medium) − 1. The factor falls from 0.50 to 0.125, so the focal length quadruples.'],
 [3,'Two thin prisms with opposite orientations have apex angles 8° and 5°, and indices 1.50 and 1.60 for the same light. What is the magnitude of their net deviation?','1°',['0°','3°','7°'],'The individual deviations are 0.50 × 8° = 4° and 0.60 × 5° = 3° in opposite directions.'],
 [0,'A particle moves along x = 2t³ − 9t² + 12t in SI units. What distance does it travel between t = 1 s and t = 3 s?','6 m',['4 m','8 m','10 m'],'v = 6(t − 1)(t − 2), so it turns at 2 s. The positions at 1, 2 and 3 s are 5, 4 and 9 m.'],
 [1,'A 1 kg cart at 8 m/s sticks to a stationary 3 kg cart on a smooth track. How much kinetic energy is lost?','24 J',['8 J','16 J','32 J'],'Momentum gives a common speed of 2 m/s. The kinetic energy falls from 32 J to 8 J.'],
 [2,'A 2 kg block moving at 6 m/s compresses a spring of constant 800 N/m on a smooth floor. Find maximum compression.','0.30 m',['0.15 m','0.45 m','0.60 m'],'At maximum compression, ½mv² = ½kx². Thus x = √(72/800) = 0.30 m.'],
 [4,'A string fixed at both ends has length 0.8 m and wave speed 64 m/s. What is the frequency of its third harmonic?','120 Hz',['40 Hz','80 Hz','160 Hz'],'The fundamental is v/(2L) = 40 Hz. Multiply by three.'],
 [5,'A 6 Ω and a 3 Ω resistor in parallel are connected in series with 2 Ω across an ideal 12 V source. What is the current through the 3 Ω resistor?','2 A',['1 A','3 A','4 A'],'The parallel pair is 2 Ω, so total current is 3 A. The parallel voltage is 6 V. Divide by 3 Ω.'],
 [7,'A hydrogen atom emits a photon as its electron drops from n = 4 to n = 2. Given Eₙ = −13.6/n² eV, find the photon energy.','2.55 eV',['0.85 eV','3.40 eV','10.20 eV'],'The energy released is 13.6(1/4 − 1/16) = 2.55 eV.']
];

function subjectChallenge() {
 const rows = SUBJECT === 'maths' ? MATHS_CHALLENGE : PHYSICS_CHALLENGE;
 return rows.map(([topic,prompt,correct,distractors,explanation],index)=>({
  ...exercise(prompt,correct,distractors,explanation,(index+2)%4),
  id:SUBJECT+'-challenge-'+(index+1),topic,xp:50+10*(index%5)
 }));
}
