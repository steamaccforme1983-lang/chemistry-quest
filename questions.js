// Original practice questions; not official previous-year exam questions.
const TOPICS = [
 ['Periodicity','Inorganic'],['Chemical Bonding','Inorganic'],['d/f Block','Inorganic'],['Coordination','Inorganic'],['s Block','Inorganic'],['p Block','Inorganic'],
 ['Equilibrium','Physical'],['Thermodynamics','Physical'],['Atomic Structure / Quantum Numbers','Physical'],['Mole Concept','Physical'],['Chemical Kinetics','Physical'],
 ['GOC / IUPAC / Isomerism','Organic'],['Hydrocarbons','Organic'],['Haloalkanes','Organic'],['Alcohols','Organic'],['Aldehydes / Ketones','Organic']
];
// Each row: prompt, four options, zero-based answer, explanation.
const RAW = [
 [
 ['Which atom has the largest atomic radius?',['Li','Na','K','Rb'],3,'Atomic radius increases down Group 1 because a new electron shell is added at each step.'],
 ['Which element has the highest first ionisation enthalpy?',['B','C','N','O'],2,'Nitrogen has a stable half-filled 2p³ subshell. Oxygen loses a paired 2p electron more easily.'],
 ['Which element is the most electronegative?',['Cl','O','N','F'],3,'Fluorine has the highest electronegativity on the Pauling scale.'],
 ['Among these isoelectronic ions, which is smallest?',['O²⁻','F⁻','Na⁺','Mg²⁺'],3,'All have 10 electrons. Mg²⁺ has the highest nuclear charge and pulls that electron cloud most strongly.']
 ],[
 ['What is the molecular shape of NH₃?',['Trigonal planar','Trigonal pyramidal','Tetrahedral','Linear'],1,'Three N–H bonds and one lone pair give a tetrahedral electron-pair arrangement but a trigonal pyramidal molecular shape.'],
 ['What is the hybridisation of carbon in CH₄?',['sp','sp²','sp³','dsp²'],2,'Four equivalent sigma bonds around carbon correspond to sp³ hybridisation.'],
 ['Which molecule has zero net dipole moment?',['H₂O','NH₃','SO₂','CO₂'],3,'Linear CO₂ has two equal C=O bond dipoles pointing in opposite directions, so they cancel.'],
 ['According to molecular orbital theory, the bond order of O₂ is:',['1','1.5','2','3'],2,'Bond order = (bonding electrons − antibonding electrons)/2 = (10 − 6)/2 = 2.']
 ],[
 ['What is the ground-state electronic configuration of Cr (Z = 24)?',['[Ar] 3d⁴ 4s²','[Ar] 3d⁵ 4s¹','[Ar] 3d⁶ 4s⁰','[Ar] 3d³ 4s³'],1,'Chromium has [Ar] 3d⁵ 4s¹, with a half-filled 3d subshell.'],
 ['What is the oxidation state of Mn in KMnO₄?',['+2','+4','+6','+7'],3,'For a neutral compound: +1 + x + 4(−2) = 0, so x = +7.'],
 ['The gradual decrease in lanthanoid ionic radii is mainly due to:',['Strong shielding by 4f electrons','Poor shielding by 4f electrons','Loss of all 4f electrons','A decrease in nuclear charge'],1,'4f electrons shield poorly, so effective nuclear attraction increases across the series, causing lanthanoid contraction.'],
 ['How many unpaired electrons does a free Fe³⁺ ion have?',['1','3','4','5'],3,'Fe is [Ar] 3d⁶ 4s². Removing two 4s electrons and one 3d electron gives 3d⁵, with five unpaired electrons.']
 ],[
 ['What is the coordination number of Co in [Co(NH₃)₆]Cl₃?',['3','4','6','9'],2,'Six monodentate ammonia ligands each donate one lone pair directly to cobalt.'],
 ['What is the oxidation state of Fe in [Fe(CN)₆]⁴⁻?',['+2','+3','+4','−2'],0,'Each CN⁻ has charge −1. Thus x − 6 = −4, giving Fe in the +2 state.'],
 ['Which ligand is bidentate?',['NH₃','Cl⁻','CO','Ethylenediamine (en)'],3,'Ethylenediamine binds through two nitrogen donor atoms and can form a chelate ring.'],
 ['Which complex can show cis–trans isomerism?',['[Pt(NH₃)₂Cl₂] (square planar)','[Ni(CO)₄] (tetrahedral)','[Ag(NH₃)₂]⁺ (linear)','[Co(NH₃)₆]³⁺ (octahedral)'],0,'Square-planar [Pt(NH₃)₂Cl₂] can have the two chloride ligands adjacent (cis) or opposite (trans).']
 ],[
 ['Which Group 1 metal gives a lilac flame?',['Li','Na','K','Cs'],2,'Potassium gives a lilac flame; sodium gives an intense yellow flame.'],
 ['Which alkaline earth metal has the smallest atomic radius?',['Be','Mg','Ca','Sr'],0,'Atomic radius increases down Group 2, so beryllium is the smallest of these atoms.'],
 ['Which Group 1 carbonate readily decomposes to its oxide and CO₂ on heating?',['Li₂CO₃','Na₂CO₃','K₂CO₃','Rb₂CO₃'],0,'Small Li⁺ strongly polarises the carbonate ion, making Li₂CO₃ less thermally stable than the other alkali carbonates.'],
 ['Which hydroxide is amphoteric?',['NaOH','KOH','Ca(OH)₂','Be(OH)₂'],3,'Be(OH)₂ reacts with both acids and strong bases, showing amphoteric behaviour.']
 ],[
 ['What is the shape of BF₃?',['Trigonal pyramidal','Trigonal planar','Bent','Tetrahedral'],1,'Boron has three bonding regions and no lone pair in BF₃, giving a trigonal planar shape.'],
 ['What is the oxidation state of sulfur in H₂SO₄?',['+2','+4','+6','−2'],2,'2(+1) + x + 4(−2) = 0, so sulfur is in the +6 oxidation state.'],
 ['Why is NH₃ more basic than PH₃ in aqueous solution?',['NH₃ has no lone pair','The nitrogen lone pair is more available for protonation','Phosphorus is more electronegative than nitrogen','PH₃ is trigonal planar'],1,'NH₃ accepts a proton much more readily; its nitrogen lone pair is more available for bonding than the lone pair in PH₃.'],
 ['Which hydrogen halide has the highest boiling point at atmospheric pressure?',['HF','HCl','HBr','HI'],0,'HF molecules form strong intermolecular hydrogen bonds, giving HF the highest boiling point in this group.']
 ],[
 ['What is the pH of 1.0 × 10⁻³ mol L⁻¹ HCl at 25 °C, assuming complete dissociation?',['1','3','7','11'],1,'HCl is a strong acid, so [H⁺] ≈ 10⁻³ mol L⁻¹ and pH = −log₁₀[H⁺] = 3.'],
 ['For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), increasing pressure at constant temperature favours:',['N₂ and H₂','NH₃','No change in equilibrium composition','Only H₂'],1,'Higher pressure favours the side with fewer gas molecules: two moles of NH₃ versus four moles of reactants.'],
 ['For H₂(g) + I₂(g) ⇌ 2HI(g), Kp and Kc are related by:',['Kp = Kc','Kp = KcRT','Kp = Kc/(RT)','Kp = Kc(RT)²'],0,'Kp = Kc(RT)^Δn. Here Δn = 2 − (1 + 1) = 0, so Kp = Kc.'],
 ['Adding sodium acetate to aqueous acetic acid causes the acid’s ionisation to:',['Increase','Decrease','Become complete','Remain exactly unchanged'],1,'Acetate is a common ion. Adding it shifts CH₃COOH ⇌ H⁺ + CH₃COO⁻ toward the undissociated acid.']
 ],[
 ['A system absorbs 50 J of heat and has 20 J of work done on it. What is ΔU?',['+30 J','−30 J','+70 J','−70 J'],2,'Using the chemistry sign convention, ΔU = q + w = 50 + 20 = +70 J.'],
 ['At constant temperature and pressure, a process is thermodynamically spontaneous if:',['ΔG < 0','ΔG > 0','ΔH is always positive','ΔS is always zero'],0,'A spontaneous process at constant temperature and pressure has a negative Gibbs energy change.'],
 ['For an exothermic reaction, the enthalpy change ΔH is:',['Positive','Negative','Always zero','Equal to temperature'],1,'An exothermic reaction releases heat to the surroundings and has ΔH < 0.'],
 ['If ΔH = −40 kJ mol⁻¹ and ΔS = −100 J mol⁻¹ K⁻¹, what is ΔG at 300 K?',['−70 kJ mol⁻¹','−40 kJ mol⁻¹','−10 kJ mol⁻¹','+10 kJ mol⁻¹'],2,'Convert ΔS to −0.100 kJ mol⁻¹ K⁻¹. ΔG = ΔH − TΔS = −40 − 300(−0.100) = −10 kJ mol⁻¹.']
 ],[
 ['What is the maximum number of electrons in the n = 3 shell?',['8','10','18','32'],2,'A shell holds at most 2n² electrons. For n = 3, this is 18.'],
 ['Which quantum-number set (n, l, mₗ) is allowed?',['(2, 2, 0)','(3, 1, −1)','(1, 0, 1)','(3, −1, 0)'],1,'For n = 3, l may be 0, 1 or 2. For l = 1, mₗ may be −1, 0 or +1.'],
 ['How many orbitals are in a d subshell?',['2','3','5','7'],2,'For a d subshell, l = 2. The five mₗ values (−2 to +2) describe five orbitals.'],
 ['The de Broglie wavelength of a particle of momentum p is:',['hp','h/p','p/h','h/p²'],1,'The wave–particle relation is λ = h/p, where h is Planck’s constant.']
 ],[
 ['How many moles are present in 18 g of H₂O? (H = 1, O = 16)',['0.5 mol','1 mol','2 mol','18 mol'],1,'The molar mass of H₂O is 18 g mol⁻¹. Moles = 18/18 = 1 mol.'],
 ['How many molecules are in 0.5 mol of CO₂? (Nₐ = 6.022 × 10²³ mol⁻¹)',['6.022 × 10²³','3.011 × 10²³','1.2044 × 10²⁴','0.5 × 10²²'],1,'Number of molecules = nNₐ = 0.5 × 6.022 × 10²³ = 3.011 × 10²³.'],
 ['2 mol H₂ and 2 mol O₂ react to form water. Which is the limiting reactant?',['H₂','O₂','Both in exact proportion','Neither'],0,'2H₂ + O₂ → 2H₂O. Two moles of H₂ require only one mole of O₂, so H₂ is used up first.'],
 ['What is the molarity when 0.20 mol solute is dissolved to make 500 mL of solution?',['0.10 mol L⁻¹','0.20 mol L⁻¹','0.40 mol L⁻¹','2.50 mol L⁻¹'],2,'Molarity = moles/solution volume in litres = 0.20/0.500 = 0.40 mol L⁻¹.']
 ],[
 ['For rate = k[A]²[B], the overall reaction order is:',['1','2','3','4'],2,'The overall order is the sum of concentration exponents: 2 + 1 = 3.'],
 ['The half-life of a first-order reaction is:',['k/0.693','0.693/k','1/(k[A]₀)','[A]₀/(2k)'],1,'For a first-order reaction, t½ = ln 2/k = 0.693/k, independent of initial concentration.'],
 ['What are the units of a first-order rate constant?',['mol L⁻¹ s⁻¹','L mol⁻¹ s⁻¹','s⁻¹','mol² L⁻² s⁻¹'],2,'For rate = k[A], dividing concentration per time by concentration leaves inverse time, s⁻¹.'],
 ['A catalyst increases reaction rate primarily by:',['Increasing equilibrium constant','Lowering activation energy','Increasing reaction enthalpy','Making ΔG more negative'],1,'A catalyst provides a pathway with a lower activation barrier. It does not change the equilibrium constant at a given temperature.']
 ],[
 ['What is the IUPAC name of CH₃CH(CH₃)CH₂CH₃?',['2-Methylbutane','3-Methylbutane','Pentane','2-Ethylpropane'],0,'The longest chain has four carbons. Numbering from the nearer end places the methyl group at carbon 2.'],
 ['Which carbocation is most stable?',['CH₃⁺','CH₃CH₂⁺','(CH₃)₂CH⁺','(CH₃)₃C⁺'],3,'Among simple alkyl carbocations, greater alkyl substitution stabilises positive charge by hyperconjugation and the +I effect.'],
 ['Butane and 2-methylpropane are examples of:',['Chain isomerism','Position isomerism','Geometrical isomerism','Optical isomerism'],0,'They have the same molecular formula, C₄H₁₀, but different carbon skeletons.'],
 ['Which species is an electrophile?',['OH⁻','NH₃','NO₂⁺','Cl⁻'],2,'NO₂⁺ is electron deficient and accepts an electron pair; it is the electrophile in aromatic nitration.']
 ],[
 ['The major product when propene reacts with HBr in the absence of peroxides is:',['1-Bromopropane','2-Bromopropane','1,2-Dibromopropane','Propane'],1,'Markovnikov addition places Br on the more substituted carbon via the more stable secondary carbocation.'],
 ['Benzene most characteristically undergoes:',['Electrophilic substitution','Nucleophilic addition','Free-radical addition','Elimination'],0,'Electrophilic substitution replaces a hydrogen while restoring the stable aromatic π system.'],
 ['How many sigma and pi bonds are in ethyne (C₂H₂)?',['2 σ and 3 π','3 σ and 2 π','4 σ and 1 π','5 σ and 0 π'],1,'The C≡C bond contains one σ and two π bonds; two C–H bonds add two more σ bonds.'],
 ['Which reagent distinguishes ethene from ethane under ordinary laboratory conditions?',['Bromine water','Sodium chloride solution','Dilute NaOH','Limewater'],0,'Ethene decolourises bromine water by addition across its C=C bond. Ethane does not react this way without radical conditions.']
 ],[
 ['Which alkyl halide generally reacts fastest by an SN1 mechanism in a polar protic solvent?',['CH₃Cl','CH₃CH₂Cl','(CH₃)₂CHCl','(CH₃)₃CCl'],3,'Tertiary butyl chloride forms the most stable carbocation among these substrates, favouring SN1.'],
 ['Bromoethane heated with aqueous KOH mainly gives:',['Ethene','Ethanol','Ethane','Ethanal'],1,'Aqueous hydroxide replaces Br by OH through nucleophilic substitution to form ethanol.'],
 ['Bromoethane heated with alcoholic KOH mainly gives:',['Ethanol','Ethene','Ethanoic acid','Ethoxyethane'],1,'Hot alcoholic KOH favours β-elimination of HBr to give ethene.'],
 ['The Finkelstein reaction converts an alkyl chloride or bromide to an alkyl iodide using:',['NaI in dry acetone','KI in water only','H₂SO₄ in water','Cl₂ in sunlight'],0,'NaI in dry acetone enables halide exchange. Precipitation of NaCl or NaBr helps drive the reaction.']
 ],[
 ['Ethanol heated with concentrated H₂SO₄ at about 443 K mainly gives:',['Ethene','Ethanal','Ethanoic acid','Methane'],0,'At about 443 K, concentrated sulfuric acid dehydrates ethanol to ethene.'],
 ['Which alcohol gives an immediate Lucas-test turbidity at room temperature?',['Methanol','Ethanol','Propan-1-ol','2-Methylpropan-2-ol'],3,'A tertiary alcohol reacts rapidly with concentrated HCl/ZnCl₂ to form an insoluble alkyl chloride.'],
 ['Controlled oxidation of propan-2-ol gives:',['Propanal','Propanone','Propanoic acid','Propene'],1,'Oxidation of a secondary alcohol produces a ketone; propan-2-ol gives propanone.'],
 ['Which gas is released when ethanol reacts with sodium metal?',['O₂','CO₂','H₂','CH₄'],2,'2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂. Sodium replaces the hydroxyl hydrogen.']
 ],[
 ['Which compound gives a positive Tollens’ test?',['Ethanal','Propanone','Benzophenone','Diethyl ether'],0,'Ethanal is an aldehyde. It reduces Tollens’ reagent to metallic silver while being oxidised.'],
 ['Which compound gives a positive iodoform test?',['Methanal','Benzaldehyde','Propanone','Diethyl ether'],2,'Propanone contains the CH₃CO– group, which gives yellow CHI₃ in the iodoform reaction.'],
 ['Which compound can undergo self-aldol addition?',['Methanal','Benzaldehyde','Ethanal','Tetrachloromethane'],2,'Ethanal has α-hydrogens, allowing enolate formation and aldol addition. Methanal and benzaldehyde have no α-hydrogens.'],
 ['Reduction of ethanal with NaBH₄ followed by work-up gives:',['Ethanoic acid','Ethanol','Ethene','Ethane'],1,'NaBH₄ reduces the aldehyde carbonyl group to a primary alcohol, giving ethanol.']
 ]
];
const QUESTIONS = RAW.flatMap((rows,t) => rows.map((r,i) => ({id:`${t}-${i}`,topic:t,prompt:r[0],options:r[1],answer:r[2],explanation:r[3]})));
if(typeof module !== 'undefined') module.exports = {TOPICS, QUESTIONS};
