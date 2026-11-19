'use strict';

// Transcribed from the supplied NTA PDF, Chemistry, pages 7–11.
// Line wrapping is normalized; chemical subscripts and Greek symbols are restored.
const chemistryUnit=(number,title,group,entries)=>({
 id:`chem2027-u${String(number).padStart(2,'0')}`,number,title,group,
 subtopics:entries.map(([slug,text])=>({id:`chem2027-u${String(number).padStart(2,'0')}-${slug}`,slug,text}))
});
const CHEMISTRY_SYLLABUS_2027=[
 chemistryUnit(1,'Some Basic Concepts in Chemistry','Physical Chemistry',[
  ['matter',"Matter and its nature, Dalton's atomic theory, Concept of atom, molecule, element and compound,"],
  ['laws','Laws of chemical combination, Atomic and molecular masses,'],
  ['mole','mole concept, molar mass, percentage composition,'],
  ['formulae','empirical and molecular formulae,'],
  ['stoichiometry','Chemical equations and stoichiometry.']
 ]),
 chemistryUnit(2,'Atomic Structure','Physical Chemistry',[
  ['radiation','Nature of electromagnetic radiation, photoelectric effect, spectrum of the hydrogen atom,'],
  ['bohr',"Bohr model of a hydrogen atom - its postulates, derivation of the relations for the energy of the electron and radii of the different orbits, limitations of Bohr's model,"],
  ['matter-waves',"dual nature of matter, de Broglie's relationship, Heisenberg uncertainty principle,"],
  ['orbitals','elementary ideas of quantum mechanics, the quantum mechanical model of the atom and its important features, concept of atomic orbitals as one-electron wave functions, variation of ψ and ψ² with r for 1s and 2s orbitals,'],
  ['quantum','various quantum numbers (principal, angular momentum and magnetic quantum numbers) and their significance, shapes of s, p and d - orbitals, electron spin and spin quantum number,'],
  ['configuration',"rules for filling electrons in orbitals – Aufbau principle, Pauli's exclusion principle and Hund's rule, electronic configuration of elements and extra stability of half-filled and completely filled orbitals."]
 ]),
 chemistryUnit(3,'Chemical Bonding and Molecular Structure','Physical Chemistry',[
  ['lewis','Kossel-Lewis approach to chemical bond formation, the concept of ionic and covalent bonds.'],
  ['ionic','Ionic Bonding: Formation of ionic bonds, factors affecting the formation of ionic bonds; calculation of lattice enthalpy.'],
  ['vsepr','Covalent Bonding: Concept of electronegativity, Fajan’s rule, dipole moment, Valence Shell Electron Pair Repulsion (VSEPR) theory and shapes of simple molecules.'],
  ['hybridization','Quantum mechanical approach to covalent bonding: Valence bond theory - its important features, the concept of hybridization involving s, p and d orbitals, resonance.'],
  ['molecular-orbitals','Molecular Orbital Theory - Its important features, LCAOs, types of molecular orbitals (bonding, antibonding), sigma and pi-bonds, molecular orbital electronic configurations of homonuclear diatomic molecules, the concept of bond order, bond length and bond energy.'],
  ['hydrogen-bonding','Elementary idea of metallic bonding, hydrogen bonding and its applications.']
 ]),
 chemistryUnit(4,'Chemical Thermodynamics','Physical Chemistry',[
  ['fundamentals','Fundamentals of thermodynamics: System and surroundings, extensive and intensive properties, state functions, entropy, types of processes.'],
  ['first-law','The first law of thermodynamics - Concept of work, heat, internal energy and enthalpy, heat capacity, molar heat capacity,'],
  ['enthalpy','Hess’s law of constant heat summation, Enthalpies of bond dissociation, combustion, formation, atomization, sublimation, phase transition, hydration, ionization and solution.'],
  ['spontaneity','The second law of thermodynamics - Spontaneity of processes, ΔS of the universe and ΔG of the system as criteria for spontaneity. ΔG° (Standard Gibbs energy change) and equilibrium constant.']
 ]),
 chemistryUnit(5,'Solutions','Physical Chemistry',[
  ['concentration','Different methods for expressing the concentration of solution - molality, molarity, mole fraction, percentage (by volume and mass both),'],
  ['raoult',"the vapour pressure of solutions and Raoult's Law - Ideal and non-ideal solutions, vapour pressure - composition, plots for ideal and non-ideal solutions,"],
  ['colligative','Colligative properties of dilute solutions - a relative lowering of vapour pressure, depression of freezing point, the elevation of boiling point and osmotic pressure,'],
  ['molar-mass','determination of molecular mass using colligative properties, abnormal value of molar mass, van’t Hoff factor and its significance.']
 ]),
 chemistryUnit(6,'Equilibrium','Physical Chemistry',[
  ['dynamic','Meaning of equilibrium is the concept of dynamic equilibrium.'],
  ['physical',"Equilibria involving physical processes: Solid-liquid, liquid-gas, gas-gas and solid-gas equilibria, Henry's law. General characteristics of equilibrium involving physical processes."],
  ['chemical','Equilibrium involving chemical processes: Law of chemical equilibrium, equilibrium constants (Kp and Kc) and their significance, the significance of ΔG and ΔG° in chemical equilibrium, factors affecting equilibrium concentration, pressure, temperature, the effect of catalyst, Le Chatelier’s principle.'],
  ['acids','Ionic equilibrium: Weak and strong electrolytes, ionization of electrolytes, various concepts of acids and bases (Arrhenius, Bronsted - Lowry and Lewis) and their ionization, acid-base equilibria (including multistage ionization) and ionization constants,'],
  ['ph','ionization of water, pH scale, common ion effect, hydrolysis of salts and pH of their solutions,'],
  ['solubility','the solubility of sparingly soluble salts, solubility products and buffer solutions.']
 ]),
 chemistryUnit(7,'Redox Reactions and Electrochemistry','Physical Chemistry',[
  ['redox','Electronic concepts of oxidation and reduction, redox reactions, oxidation number, rules for assigning oxidation number and balancing of redox reactions.'],
  ['conductance','Electrolytic and metallic conduction, conductance in electrolytic solutions, molar conductivities and their variation with concentration, Kohlrausch’s law and its applications.'],
  ['cells',"Electrochemical cells - Electrolytic and Galvanic cells, different types of electrodes, electrode potentials including standard electrode potential, half-cell and cell reactions, emf of a Galvanic cell and its measurement, Nernst equation and its applications, relationship between cell potential and Gibbs' energy change, dry cell and lead accumulator, fuel cells."]
 ]),
 chemistryUnit(8,'Chemical Kinetics','Physical Chemistry',[
  ['rates','Rate of a chemical reaction, factors affecting the rate of reactions: concentration, temperature, pressure and catalyst, elementary and complex reactions,'],
  ['order','order and molecularity of reactions, rate law, rate constant and its units,'],
  ['integrated','differential and integral forms of zero and first-order reactions, their characteristics and half-lives,'],
  ['arrhenius','the effect of temperature on the rate of reactions, Arrhenius theory, activation energy and its calculation, collision theory of bi-molecular gaseous reactions (no derivation).']
 ]),
 chemistryUnit(9,'Classification of Elements and Periodicity in Properties','Inorganic Chemistry',[
  ['classification','Modern periodic law and present form of the periodic table, s, p, d and f block elements,'],
  ['radii','periodic trends in properties of elements atomic and ionic radii,'],
  ['energy','ionization enthalpy, electron gain enthalpy,'],
  ['valence','valence, oxidation states and chemical reactivity.']
 ]),
 chemistryUnit(10,'p-Block Elements','Inorganic Chemistry',[
  ['groups','Group -13 to Group 18 Elements'],
  ['configuration','General Introduction: Electronic configuration and general trends in physical and chemical properties of elements across the periods and down the groups,'],
  ['first-member','unique behaviour of the first element in each group.']
 ]),
 chemistryUnit(11,'d- and f-Block Elements','Inorganic Chemistry',[
  ['transition','Transition Elements - General introduction, electronic configuration, occurrence and characteristics, general trends in properties of the first-row transition elements - physical properties, ionization enthalpy, oxidation states, atomic radii, colour, catalytic behaviour, magnetic properties, complex formation, interstitial compounds, alloy formation,'],
  ['oxidants','preparation, properties and uses of K₂Cr₂O₇ and KMnO₄.'],
  ['lanthanoids','Inner Transition Elements. Lanthanoids - Electronic configuration, oxidation states and Lanthanoid contraction.'],
  ['actinoids','Actinoids - Electronic configuration and oxidation states.']
 ]),
 chemistryUnit(12,'Coordination Compounds','Inorganic Chemistry',[
  ['ligands',"Introduction to coordination compounds. Werner's theory, ligands, coordination number, denticity, chelation,"],
  ['nomenclature','IUPAC nomenclature of mononuclear co-ordination compounds, isomerism,'],
  ['bonding','Bonding: Valence bond approach and basic ideas of Crystal field theory, colour and magnetic properties,'],
  ['applications','importance of coordination compounds (in qualitative analysis, extraction of metals and in biological systems).']
 ]),
 chemistryUnit(13,'Purification and Characterisation of Organic Compounds','Organic Chemistry',[
  ['purification','Purification - Crystallization, sublimation, distillation, differential extraction and chromatography - principles and their applications.'],
  ['qualitative','Qualitative analysis - Detection of nitrogen, sulphur, phosphorus and halogens.'],
  ['quantitative','Quantitative analysis (basic principles only) - Estimation of carbon, hydrogen, nitrogen, halogens, sulphur and phosphorus.'],
  ['formulae','Calculations of empirical formulae and molecular formulae, numerical problems in organic quantitative analysis.']
 ]),
 chemistryUnit(14,'Some Basic Principles of Organic Chemistry','Organic Chemistry',[
  ['classification','Tetravalency of carbon, shapes of simple molecules - hybridization (s and p): classification of organic compounds based on functional groups and those containing halogens, oxygen, nitrogen and sulphur, homologous series: Isomerism - structural and stereoisomerism.'],
  ['nomenclature','Nomenclature (Trivial and IUPAC)'],
  ['intermediates','Covalent bond fission - Homolytic and heterolytic, free radicals, carbocations and carbanions, stability of carbocations and free radicals, electrophiles and nucleophiles.'],
  ['effects','Electronic displacement in a covalent bond - Inductive effect, electromeric effect, resonance and hyperconjugation.'],
  ['reactions','Common types of organic reactions - Substitution, addition, elimination and rearrangement.']
 ]),
 chemistryUnit(15,'Hydrocarbons','Organic Chemistry',[
  ['overview','Classification, isomerism, IUPAC nomenclature, general methods of preparation, properties and reactions.'],
  ['alkanes','Alkanes - Conformations: Sawhorse and Newman projections (of ethane), mechanism of halogenation of alkanes.'],
  ['alkenes','Alkenes - Geometrical isomerism, mechanism of electrophilic addition, addition of hydrogen, halogens, water, hydrogen halides (Markownikoffs and peroxide effect), Ozonolysis and polymerization.'],
  ['alkynes','Alkynes - Acidic character, addition of hydrogen, halogens, water and hydrogen halides, polymerization.'],
  ['aromatics',"Aromatic hydrocarbons - Nomenclature, benzene - structure and aromaticity, mechanism of electrophilic substitution, halogenation, nitration. Friedel-Craft's alkylation and acylation, directive influence of the functional group in mono-substituted benzene."]
 ]),
 chemistryUnit(16,'Organic Compounds Containing Halogens','Organic Chemistry',[
  ['reactions','General methods of preparation, properties and reactions, nature of C-X bond, mechanisms of substitution reactions.'],
  ['environment','Uses, environmental effects of chloroform, iodoform, freons and DDT.']
 ]),
 chemistryUnit(17,'Organic Compounds Containing Oxygen','Organic Chemistry',[
  ['overview','General methods of preparation, properties, reactions and uses. ALCOHOLS, PHENOLS AND ETHERS'],
  ['alcohols','Alcohols: Identification of primary, secondary and tertiary alcohols, mechanism of dehydration.'],
  ['phenols','Phenols: Acidic nature, electrophilic substitution reactions, halogenation, nitration and sulphonation, Reimer - Tiemann reaction.'],
  ['ethers','Ethers: Structure.'],
  ['carbonyl','Aldehyde and Ketones: Nature of carbonyl group, nucleophilic addition to >C=O group, relative reactivities of aldehydes and ketones, important reactions such as - Nucleophilic addition reactions (addition of HCN, NH₃ and its derivatives), Grignard reagent, oxidation, reduction (Wolf Kishner and Clemmensen), the acidity of α-hydrogen. Aldol condensation, Cannizzaro reaction, Haloform reaction, chemical tests to distinguish between aldehydes and ketones.'],
  ['acids','Carboxylic Acids: Acidic strength and factors affecting it.']
 ]),
 chemistryUnit(18,'Organic Compounds Containing Nitrogen','Organic Chemistry',[
  ['overview','General methods of preparation, properties, reactions and uses.'],
  ['amines','Amines: Nomenclature, classification, structure, basic character and identification of primary, secondary and tertiary amines and their basic character.'],
  ['diazonium','Diazonium Salts: Importance in synthetic organic chemistry.']
 ]),
 chemistryUnit(19,'Biomolecules','Organic Chemistry',[
  ['overview','General introduction and importance of biomolecules.'],
  ['carbohydrates','CARBOHYDRATES – Classification, aldoses and ketoses, monosaccharides (glucose and fructose) and constituent monosaccharides of oligosaccharides (sucrose, lactose and maltose).'],
  ['proteins','PROTEINS - Elementary idea of α-amino acids, peptide bond, polypeptides, proteins: primary, secondary, tertiary and quaternary structure (qualitative idea only), denaturation of proteins, enzymes.'],
  ['vitamins','VITAMINS – Classification and functions.'],
  ['nucleic-acids','NUCLEIC ACIDS – Chemical constitution of DNA and RNA, biological functions of nucleic acids.'],
  ['hormones','Hormones (General introduction)']
 ]),
 chemistryUnit(20,'Principles Related to Practical Chemistry','Practical Chemistry',[
  ['detection','Detection of extra elements (Nitrogen, sulphur, halogens) in organic compounds, detection of the following functional groups, hydroxyl (alcoholic and phenolic), carbonyl (aldehyde and ketones) carboxyl and amino groups in organic compounds.'],
  ['preparations','The chemistry involved in the preparation of the following: Inorganic compounds, Mohr’s salt, potash alum. Organic compounds: Acetanilide, p-nitro acetanilide, aniline yellow, iodoform.'],
  ['titration','The chemistry involved in the titrimetric exercises – acids, bases and the use of indicators, oxalic-acid vs KMnO₄, Mohr’s salt vs KMnO₄.'],
  ['cations','Chemical principles involved in the qualitative salt analysis: Cations – Pb²⁺, Cu²⁺, Al³⁺, Fe³⁺, Zn²⁺, Ni²⁺, Ca²⁺, Ba²⁺, Mg²⁺, NH₄⁺.'],
  ['anions','Anions – CO₃²⁻, S²⁻, SO₄²⁻, NO₃⁻, NO₂⁻, Cl⁻, Br⁻, I⁻ (Insoluble salts excluded).'],
  ['experiments','Chemical principles involved in the following experiments: 1. Enthalpy of solution of CuSO₄. 2. Enthalpy of neutralization of strong acid and strong base. 3. Preparation of lyophilic and lyophobic sols. 4. Kinetic study of the reaction of iodide ions with hydrogen peroxide at room temperature.']
 ])
];
const CHEMISTRY_LEGACY_CHAPTERS=[
 {name:'s Block',status:'legacy',reason:'Standalone s-block compound chemistry is not an explicit 2027 unit. Block classification, radii and periodic trends are mapped to Unit 9.',questionIds:['4-0','4-2','4-3','v-4-0','v-4-2','v-4-3']},
 {name:'p Block',status:'mapped',reason:'General group trends map to Unit 10. Shape, oxidation-number, Lewis-base and hydrogen-bond questions map to Units 3 and 9.'}
];
const CHEMISTRY_CHAPTER_MAPPINGS=[
 {from:'Periodicity',units:[9]},{from:'Chemical Bonding',units:[3]},
 {from:'d/f Block',units:[11]},{from:'Coordination',units:[12]},
 {from:'s Block',units:[9],legacy:true},{from:'p Block',units:[3,9,10]},
 {from:'Equilibrium',units:[6]},{from:'Thermodynamics',units:[4]},
 {from:'Atomic Structure / Quantum Numbers',units:[2]},{from:'Mole Concept',units:[1]},
 {from:'Chemical Kinetics',units:[8]},{from:'GOC / IUPAC / Isomerism',units:[14]},
 {from:'Hydrocarbons',units:[15]},{from:'Haloalkanes',units:[16]},
 {from:'Alcohols',units:[17]},{from:'Aldehydes/Ketones',units:[17]}
];
JEE_UNITS.chemistry=CHEMISTRY_SYLLABUS_2027.map(unit=>[unit.title,unit.group,unit.subtopics.map(topic=>topic.text).join(' ')]);
const isChemistry2027=isJee&&SUBJECT==='chemistry';
