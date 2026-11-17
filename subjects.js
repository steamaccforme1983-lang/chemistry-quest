'use strict';

// These paired problems use the same method with different values on a retake.
const requestedSubject = new URLSearchParams(globalThis.location?.search || '').get('subject');
const SUBJECT = ['maths','physics'].includes(requestedSubject) ? requestedSubject : 'chemistry';
const SUBJECT_LABEL = {chemistry:'Chemistry',maths:'Maths',physics:'Physics'}[SUBJECT];

function exercise(prompt, correct, distractors, explanation, position) {
 const options = distractors.slice();
 options.splice(position, 0, correct);
 return {prompt, options, answer:position, explanation};
}

const MATHS_PATTERNS = [
 ['Quadratics','Algebra',[
  n=>[ "What is the positive root of x² − "+n+"x − "+(n+1)+" = 0?", n+1,[n,n+2,1], "Factor as (x − "+(n+1)+")(x + 1) = 0."],
  n=>["For what k does x² − "+(2*n)+"x + k = 0 have equal roots?", n*n,[2*n,n*n+1,n*n-1],"Set the discriminant to zero: "+(2*n)+"² − 4k = 0."],
  n=>["What is the sum of the roots of 2x² − "+(2*n)+"x + 7 = 0?",n,[2*n,-n,7],"The sum is −b/a = "+(2*n)+"/2."],
  n=>["What is the minimum value of x² − "+(2*n)+"x + "+(n*n+3)+"?",3,[0,n*n,n*n+3],"Complete the square: (x − "+n+")² + 3."]
 ]],
 ['Sequences and Series','Algebra',[
  n=>["An arithmetic progression begins 4, 7, 10, … . Find term "+n+".",4+3*(n-1),[4+3*n,3*n,3*(n-1)],"Use aₙ = 4 + (n − 1)3."],
  n=>["Find the sum of the first "+n+" positive even integers.",n*(n+1),[n*n,2*n,n*(n-1)],"The sum is 2(1 + … + n) = n(n + 1)."],
  n=>["What is term "+n+" of 3, 6, 12, …?",3*2**(n-1),[3*2**n,2**n,3*n],"Multiply the first term by 2 raised to n − 1."],
  n=>["Find the sum of the infinite geometric series "+n+" + "+n+"/2 + "+n+"/4 + … .",2*n,[n,n/2,3*n],"The common ratio is ½, so the sum is a/(1 − ½)."]
 ]],
 ['Matrices and Determinants','Algebra',[
  n=>["Find the determinant of the matrix with rows ("+n+", 2) and (3, 4).",4*n-6,[4*n+6,4*n,4*n-5],"The determinant is ad − bc = "+(4*n)+" − 6."],
  n=>["For what x is the matrix with rows (x, 2) and ("+n+", 2) singular?",n,[2*n,n+1,0],"Its determinant is 2x − "+(2*n)+", which must equal zero."],
  n=>["If a 3 × 3 matrix A has det(A) = "+n+", find det(2A).",8*n,[2*n,4*n,6*n],"Scaling each of three rows by 2 multiplies the determinant by 2³."],
  n=>["A diagonal matrix has diagonal entries 2, 3 and "+n+". What is its determinant?",6*n,[n+8,2*n,3*n],"Multiply the diagonal entries: 2 × 3 × "+n+"."]
 ]],
 ['Straight Lines and Circles','Coordinate geometry',[
  n=>["Find the slope of the line joining (1, 2) and (3, "+(2+2*n)+").",n,[2*n,-n,1/n],"Divide the change in y by the change in x."],
  n=>["What is the radius of x² + y² − "+(2*n)+"x + "+(n*n-4)+" = 0?",2,[4,n+2,n+3],"Complete the square to obtain (x − "+n+")² + y² = 4."],
  n=>["How far is ("+n+", 0) from the line x = 1?",n-1,[n,n+1,2*n],"The shortest path is horizontal, with length |"+n+" − 1|."],
  n=>["What is the y-intercept of "+n+"x + 2y = "+(4*n)+"?",2*n,[4*n,n,-2*n],"At the y-intercept x = 0, so divide the right side by 2."]
 ]],
 ['Differentiation','Calculus',[
  n=>["Find the gradient of y = x² + 2x at x = "+n+".",2*n+2,[n*n+2*n,2*n,2*n-2],"Differentiate to get 2x + 2, then substitute x = "+n+"."],
  n=>["At what x does y = x² − "+(2*n)+"x + 1 have a stationary point?",n,[2*n,-n,0],"Set dy/dx = 2x − "+(2*n)+" equal to zero."],
  n=>["A circle’s radius grows at 2 cm/s. Find dA/dt in cm²/s when r = "+n+" cm.",4*n+"π",[2*n+"π",n*n+"π",4*n+2+"π"],"dA/dt = 2πr · dr/dt = 4πr."],
  n=>["Find d(x³)/dx at x = "+n+".",3*n*n,[n**3,3*n,n*n],"The power rule gives 3x²."]
 ]],
 ['Integration','Calculus',[
  n=>["Evaluate ∫₀^"+n+" 2x dx.",n*n,[2*n,n*n+1,n*n-1],"The antiderivative is x². Subtract its value at zero."],
  n=>["Evaluate ∫₀¹ "+n+"x² dx.",n+"/3",[n+"/2",n,n+3],"The antiderivative is "+n+"x³/3. Evaluate it at 1 and 0."],
  n=>["Find the area between y = "+n+" and the x-axis from x = 1 to x = 4.",3*n,[n,4*n,2*n],"The region is a rectangle of height "+n+" and width 3."],
  n=>["Evaluate ∫₀^"+n+" (2x + 1) dx.",n*n+n,[n*n,2*n,n*n-n],"Evaluate x² + x at the two bounds."]
 ]],
 ['Probability and Counting','Discrete maths',[
  n=>["How many ways can two people be chosen from "+n+" people?",n*(n-1)/2,[n*(n-1),n-1,n*n],"Order is irrelevant, so use n(n − 1)/2."],
  n=>["A bag has "+n+" red and 3 blue balls. Find the probability of blue on one draw.","3/"+(n+3),[n+"/"+(n+3),"3/"+n,"1/"+(n+3)],"There are three blue outcomes among "+(n+3)+" equally likely balls."],
  n=>["How many ordered two-letter strings can be made from "+n+" letters if repetition is allowed?",n*n,[n*(n-1),2*n,n],"Each of the two positions has "+n+" independent choices."],
  n=>["A fair die is rolled once. Find the probability of a result greater than "+n+".",(6-n)+"/6",["1/6",(7-n)+"/6",(5-n)+"/6"],"The allowed faces are "+(n+1)+" through 6."]
 ]],
 ['Vectors','Coordinate geometry',[
  n=>["Find the dot product of ("+n+", 2) and (3, −1).",3*n-2,[3*n+2,3*n,3*n-1],"Multiply corresponding components and add: "+(3*n)+" − 2."],
  n=>["Find the magnitude of ("+(3*n)+", "+(4*n)+").",5*n,[7*n,3*n,4*n],"Use √((3n)² + (4n)²) = 5n."],
  n=>["For what y are (2, y) and ("+n+", −1) perpendicular?",2*n,[n,-2*n,0],"Perpendicular vectors have zero dot product: "+(2*n)+" − y = 0."],
  n=>["Find the first component of 2("+n+", 1) − (1, 2).",2*n-1,[2*n+1,n-1,2*n],"Multiply the first component by 2, then subtract 1."]
 ]]
];

const PHYSICS_PATTERNS = [
 ['Kinematics','Mechanics',[
  n=>["A body starts from rest at "+n+" m/s². How fast is it after 3 s?",3*n,[n,6*n,9*n],"Use v = u + at."],
  n=>["A body starts from rest at "+n+" m/s². How far does it move in 4 s?",8*n,[4*n,16*n,2*n],"Use s = ut + ½at² = 8a."],
  n=>["A cyclist moving at "+(2*n)+" m/s brakes uniformly at 2 m/s². When does it stop?",n,[2*n,n/2,n+2],"Use v = u − 2t and set v = 0."],
  n=>["A runner goes "+(10*n)+" m in 10 s. Find the average speed in m/s.",n,[10*n,n+1,2*n],"Average speed equals distance divided by elapsed time."]
 ]],
 ['Forces and Momentum','Mechanics',[
  n=>["A net force of "+(3*n)+" N acts on a 3 kg object. Find its acceleration in m/s².",n,[3*n,9*n,n+3],"Newton’s second law gives a = F/m."],
  n=>["Find the momentum in kg·m/s of a "+n+" kg object moving at 4 m/s.",4*n,[2*n,n+4,8*n],"Momentum is mv."],
  n=>["A "+n+" N constant net force acts for 3 s. What is the impulse in N·s?",3*n,[n/3,n,n+3],"Impulse is the product of force and time."],
  n=>["A "+n+" kg cart moving at 4 m/s sticks to an identical stationary cart. Find their speed in m/s.",2,[4,1,8],"Momentum is conserved: m(4) = (2m)v."]
 ]],
 ['Work, Energy and Power','Mechanics',[
  n=>["Find the kinetic energy in J of a "+n+" kg body moving at 4 m/s.",8*n,[4*n,16*n,2*n],"Use K = ½mv²."],
  n=>["A "+n+" N force acts along a 5 m displacement. Find the work in J.",5*n,[n/5,n+5,10*n],"The force and displacement are parallel, so W = Fd."],
  n=>["A machine delivers "+(60*n)+" J in 60 s. Find its average power in W.",n,[60*n,n/60,2*n],"Power equals work transferred per second."],
  n=>["A "+n+" kg object is raised by 3 m. Take g = 10 m/s². Find its gain in potential energy in J.",30*n,[3*n,10*n,60*n],"The increase in gravitational potential energy is mgh."]
 ]],
 ['Geometrical Optics','Light and waves',[
  n=>["A point is "+(3*n)+" cm below a flat glass surface. For near-normal viewing from air, find its apparent depth in cm if n(glass) = 1.5.",2*n,[3*n,4.5*n,n],"Apparent depth = real depth / refractive index."],
  n=>["A thin prism has an apex angle of "+n+"° and refractive index 1.5. Estimate its deviation in air in degrees.",n/2,[n,1.5*n,2*n],"Use the thin-prism approximation δ ≈ (μ − 1)A."],
  n=>["An object is "+(2*n)+" cm from a converging lens with focal length "+n+" cm. Where is its real image, in cm from the lens?",2*n,[n,3*n,n/2],"An object at 2f forms a real image at 2f on the opposite side."],
  n=>["A lens has focal length "+(100/n).toFixed(2)+" cm. What is its approximate power in dioptres?",n,[2*n,-n,n/2],"Convert the focal length to metres and take its reciprocal."]
 ]],
 ['Waves and Sound','Light and waves',[
  n=>["A wave has wavelength 2 m and frequency "+n+" Hz. Find its speed in m/s.",2*n,[n/2,n,4*n],"The wave speed is frequency times wavelength."],
  n=>["A wave completes "+(10*n)+" cycles in 10 s. Find its period in seconds.","1/"+n,[n,"1/"+(2*n),"10/"+n],"The frequency is "+n+" Hz. The period is its reciprocal."],
  n=>["An echo returns after "+(2*n)+" s. Sound travels at 340 m/s. Find the distance to the reflector in metres.",340*n,[680*n,170*n,340*n+1],"The pulse travels to the wall and back, so halve the total distance."],
  n=>["For a wave of speed 24 m/s and frequency "+n+" Hz, find its wavelength in m.",Number((24/n).toFixed(1)),[24*n,Number((12/n).toFixed(1)),Number((48/n).toFixed(1))],"Rearrange v = fλ to λ = v/f."]
 ]],
 ['Current Electricity','Electricity and modern physics',[
  n=>["Find the current in A through a "+n+" Ω resistor connected to "+(3*n)+" V.",3,[1,2,6],"Ohm’s law gives I = V/R."],
  n=>["A "+n+" Ω resistor is connected in series with a 4 Ω resistor. Find the equivalent resistance in Ω.",n+4,[n,4*n,n+5],"In series the resistances add."],
  n=>["Two identical "+n+" Ω resistors are connected in parallel. Find their equivalent resistance in Ω.",n/2,[n,2*n,n+2],"For two equal resistors in parallel, the equivalent is half of either resistor."],
  n=>["A resistor carries "+n+" A under a voltage of 4 V. Find its power in W.",4*n,[2*n,8*n,n/4],"Electrical power is P = IV."]
 ]],
 ['Thermal Physics','Electricity and modern physics',[
  n=>["How much heat in J raises 2 kg of a material of specific heat 500 J/(kg·K) by "+n+" K?",1000*n,[500*n,2000*n,1000+n],"Use Q = mcΔT."],
  n=>["The volume of an ideal gas doubles at constant temperature. If its initial pressure is "+(2*n)+" kPa, find the final pressure in kPa.",n,[2*n,4*n,n/2],"Boyle’s law gives P₁V₁ = P₂V₂, so doubling volume halves pressure."],
  n=>["A gas takes in "+(10*n)+" J and does "+(4*n)+" J of work. Find its internal energy increase in J.",6*n,[10*n,14*n,4*n],"The first law gives ΔU = heat absorbed − work done by the gas."],
  n=>["A phase change absorbs "+(200*n)+" J in "+n+" kg. Find the specific latent heat in J/kg.",200,[100,400,600],"Specific latent heat is Q/m."]
 ]],
 ['Photons and Atoms','Electricity and modern physics',[
  n=>["A photon has energy "+n+" eV. What is the energy, in eV, of a photon of twice its frequency?",2*n,[n,n/2,4*n],"Photon energy E = hf is proportional to frequency."],
  n=>["A metal has work function 2 eV. Photons of energy "+(n+2)+" eV strike it. Find the maximum photoelectron kinetic energy in eV.",n,[n+2,n+4,0],"Subtract the work function from the photon energy."],
  n=>["The first Bohr orbit has radius a₀. What is the radius in units of a₀ for hydrogen at n = "+n+"?",n*n,[n,2*n-1,n*n+1],"For hydrogen, rₙ = n²a₀."],
  n=>["The speed of light is 3 × 10⁸ m/s. What is the frequency in units of 10¹⁴ Hz for wavelength "+(3000/n).toFixed(1)+" nm, approximately?",n,[2*n,n/2,n+1],"Convert nm to metres and divide the speed of light by the wavelength."]
 ]]
];

const SUBJECT_PATTERNS = SUBJECT === 'maths' ? MATHS_PATTERNS : PHYSICS_PATTERNS;
function subjectPractice(variant) {
 return SUBJECT_PATTERNS.flatMap(([, , patterns], topic) => patterns.map((pattern, index) => {
  const base = topic === 6 && SUBJECT === 'maths' && index === 3 ? 2 : 5;
  const value = base + (variant ? 1 : 0);
  const [prompt, correct, distractors, explanation] = pattern(value);
  const patternId = SUBJECT+'-'+topic+'-'+index;
  return {...exercise(prompt,String(correct),distractors.map(String),explanation,(index+topic+(variant?1:0))%4),
   id:(variant?'v-':'')+patternId,pattern:patternId,topic};
 }));
}
