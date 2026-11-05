// Reviewed alternate problems following the same four concept patterns per topic.
const ALT_RAW = [
 [
 ['Which atom has the smallest atomic radius?',['Na','Mg','Al','Cl'],3,'Across Period 3, increasing effective nuclear charge generally decreases atomic radius; chlorine is the smallest here.'],
 ['Which has the lower first ionisation enthalpy, and why?',['Be, because 2s is filled','B, because its 2p electron is easier to remove','Be, because 2p is filled','B, because its nuclear charge is lower'],1,'Boron loses a higher-energy 2p electron; beryllium has a filled 2s² subshell, so boron has the lower first ionisation enthalpy.'],
 ['Which atom is most electronegative?',['S','Cl','Br','I'],1,'Chlorine is more electronegative than sulfur and than the halogens below it in the periodic table.'],
 ['Which is largest among these isoelectronic ions?',['N³⁻','O²⁻','F⁻','Na⁺'],0,'All have 10 electrons. Nitrogen has the smallest nuclear charge, so N³⁻ holds that electron cloud least tightly and is largest.']
 ],[
 ['What is the molecular shape of H₂O?',['Linear','Bent','Trigonal planar','Tetrahedral'],1,'Oxygen has two bonding pairs and two lone pairs. The electron-pair arrangement is tetrahedral, but the molecular shape is bent.'],
 ['What is the hybridisation of each carbon in ethene?',['sp','sp²','sp³','dsp²'],1,'Each carbon forms three sigma bonds using sp² orbitals. Its remaining p orbital forms the pi bond.'],
 ['Which molecule is nonpolar despite having polar bonds?',['NH₃','HCl','BF₃','H₂O'],2,'Trigonal planar BF₃ is symmetric, so its three B–F bond dipoles cancel.'],
 ['What is the molecular-orbital bond order of N₂?',['1','1.5','2','3'],3,'N₂ has eight valence electrons in bonding orbitals and two in antibonding orbitals: bond order = (8 − 2)/2 = 3.']
 ],[
 ['What is the ground-state configuration of Cu (Z = 29)?',['[Ar] 3d⁹ 4s²','[Ar] 3d¹⁰ 4s¹','[Ar] 3d⁸ 4s³','[Ar] 3d¹⁰ 4s²'],1,'Copper has the observed ground-state configuration [Ar] 3d¹⁰ 4s¹, with a filled 3d subshell.'],
 ['What is the oxidation state of Cr in K₂Cr₂O₇?',['+3','+4','+6','+7'],2,'2(+1) + 2x + 7(−2) = 0, giving x = +6.'],
 ['Why do Zr and Hf have very similar atomic radii?',['Both have the same atomic number','Lanthanoid contraction reduces the expected size increase','Hf contains no f electrons','Zr has more electron shells'],1,'Poor shielding by 4f electrons causes lanthanoid contraction before Hf, making its radius close to that of Zr.'],
 ['How many unpaired electrons are in a free Mn²⁺ ion?',['2','3','4','5'],3,'Mn is [Ar] 3d⁵ 4s². Mn²⁺ loses the two 4s electrons and has five singly occupied 3d orbitals.']
 ],[
 ['What is the coordination number of Pt in [PtCl₄]²⁻?',['2','4','6','8'],1,'Four monodentate chloride ligands each donate through one atom, giving coordination number 4.'],
 ['What is the oxidation state of Co in [Co(NH₃)₅Cl]²⁺?',['+1','+2','+3','+4'],2,'NH₃ is neutral and Cl⁻ has charge −1. Thus x − 1 = +2, so cobalt is +3.'],
 ['What is the denticity of an oxalate ligand when both carboxylate groups chelate one metal?',['One','Two','Three','Six'],1,'Oxalate can coordinate through two oxygen donor atoms, so it acts as a bidentate ligand.'],
 ['How many geometrical isomers exist for square-planar [Pt(NH₃)₂Br₂]?',['One','Two','Three','Four'],1,'The identical ligands may be adjacent (cis) or opposite (trans), giving two geometrical isomers.']
 ],[
 ['Which alkali metal gives a crimson-red flame?',['Li','Na','K','Rb'],0,'Lithium gives a crimson-red flame; sodium gives yellow and potassium gives lilac.'],
 ['Which Group 2 atom has the largest radius?',['Be','Mg','Ca','Ba'],3,'Atomic radius generally increases down Group 2 because additional occupied shells are added.'],
 ['Which carbonate is most thermally stable among these Group 2 compounds?',['BeCO₃','MgCO₃','CaCO₃','BaCO₃'],3,'Carbonate thermal stability increases down Group 2 as the larger cation polarises carbonate less strongly.'],
 ['Which oxide is amphoteric?',['Na₂O','K₂O','CaO','BeO'],3,'BeO reacts with acids and strong bases, unlike the strongly basic oxides listed alongside it.']
 ],[
 ['What is the molecular shape of PCl₃?',['Trigonal planar','Trigonal pyramidal','Linear','Octahedral'],1,'Phosphorus has three P–Cl bonds and one lone pair, producing a trigonal pyramidal molecular shape.'],
 ['What is the oxidation state of sulfur in SO₂?',['−2','+2','+4','+6'],2,'Each oxygen contributes −2. For neutral SO₂, x + 2(−2) = 0, so sulfur is +4.'],
 ['Why can NH₃ act as a Lewis base?',['Nitrogen can donate a lone pair','Nitrogen has an empty 2p shell','It contains no electrons','It can only donate a proton'],0,'A Lewis base donates an electron pair. The nitrogen lone pair can form a coordinate bond to a Lewis acid.'],
 ['Which compound has the highest boiling point?',['H₂O','H₂S','H₂Se','H₂Te'],0,'Water forms extensive intermolecular hydrogen bonding, raising its boiling point above the other Group 16 hydrides.']
 ],[
 ['What is the pH of 0.010 M NaOH at 25 °C, assuming complete dissociation?',['2','7','10','12'],3,'[OH⁻] = 10⁻² M gives pOH = 2. At 25 °C, pH + pOH = 14, so pH = 12.'],
 ['For 2SO₂(g) + O₂(g) ⇌ 2SO₃(g), decreasing pressure at constant temperature favours:',['SO₃ formation','SO₂ and O₂ formation','Neither side','Only O₂ formation'],1,'Lower pressure favours the side with more gas molecules: three moles on the reactant side versus two on the product side.'],
 ['For N₂(g) + 3H₂(g) ⇌ 2NH₃(g), which relation is correct?',['Kp = Kc','Kp = Kc(RT)²','Kp = Kc/(RT)²','Kp = KcRT'],2,'Δn = 2 − 4 = −2. Therefore Kp = Kc(RT)^−2 = Kc/(RT)².'],
 ['Adding NH₄Cl to aqueous NH₃ causes the concentration of OH⁻ to:',['Increase','Decrease','Become exactly zero','Remain exactly unchanged'],1,'NH₄⁺ is a common ion in NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. Adding it shifts equilibrium left and lowers [OH⁻].']
 ],[
 ['A system releases 40 J of heat while 15 J of work is done on it. What is ΔU?',['−55 J','−25 J','+25 J','+55 J'],1,'Using ΔU = q + w, heat released means q = −40 J and work on the system means w = +15 J. Thus ΔU = −25 J.'],
 ['At equilibrium at constant temperature and pressure, the reaction Gibbs energy change ΔG is:',['Negative','Positive','Zero','Always equal to ΔH'],2,'At equilibrium there is no net thermodynamic driving force in either direction, so the reaction ΔG is zero.'],
 ['For an endothermic reaction, ΔH is:',['Negative','Positive','Always zero','Always equal to ΔS'],1,'An endothermic process absorbs heat at constant pressure and has a positive enthalpy change.'],
 ['If ΔH = +20 kJ mol⁻¹ and ΔS = +100 J mol⁻¹ K⁻¹, what is ΔG at 300 K?',['−10 kJ mol⁻¹','+10 kJ mol⁻¹','+20 kJ mol⁻¹','+50 kJ mol⁻¹'],0,'Convert ΔS to 0.100 kJ mol⁻¹ K⁻¹. ΔG = ΔH − TΔS = 20 − 300(0.100) = −10 kJ mol⁻¹.']
 ],[
 ['What is the maximum electron capacity of the n = 4 shell?',['8','18','32','50'],2,'The maximum number of electrons in a shell is 2n². For n = 4, this is 32.'],
 ['Which set (n, l, mₗ) is allowed?',['(2, 1, +1)','(2, 2, +1)','(1, 1, 0)','(3, 0, −1)'],0,'For n = 2, l can be 0 or 1. With l = 1, mₗ can be −1, 0 or +1.'],
 ['How many orbitals are in an f subshell?',['3','5','7','9'],2,'For an f subshell l = 3. The 2l + 1 possible mₗ values give seven orbitals.'],
 ['If a particle’s momentum doubles, its de Broglie wavelength becomes:',['Twice as large','Half as large','Four times as large','Unchanged'],1,'Since λ = h/p, wavelength is inversely proportional to momentum. Doubling p halves λ.']
 ],[
 ['How many moles are in 44 g of CO₂? (C = 12, O = 16)',['0.5 mol','1 mol','2 mol','4 mol'],1,'The molar mass of CO₂ is 44 g mol⁻¹, so 44 g corresponds to 1 mol.'],
 ['How many molecules are in 2 mol of N₂? (Nₐ = 6.022 × 10²³ mol⁻¹)',['3.011 × 10²³','6.022 × 10²³','1.2044 × 10²⁴','2.4088 × 10²⁴'],2,'The number of molecules is nNₐ = 2 × 6.022 × 10²³ = 1.2044 × 10²⁴.'],
 ['For N₂ + 3H₂ → 2NH₃, 2 mol N₂ is mixed with 3 mol H₂. The maximum NH₃ formed is:',['1 mol','2 mol','3 mol','4 mol'],1,'Three moles of H₂ react with one mole of N₂ to form two moles of NH₃. H₂ is limiting.'],
 ['What is the molarity of a solution containing 0.15 mol solute in 250 mL?',['0.15 M','0.30 M','0.60 M','1.50 M'],2,'Molarity = moles/volume in litres = 0.15/0.250 = 0.60 mol L⁻¹.']
 ],[
 ['For rate = k[A][B]², doubling [B] with [A] fixed multiplies the rate by:',['2','3','4','8'],2,'The rate is proportional to [B]². Doubling [B] therefore multiplies the rate by 2² = 4.'],
 ['A first-order reaction has k = 0.00693 s⁻¹. What is its half-life?',['10 s','50 s','100 s','200 s'],2,'For a first-order reaction t½ = 0.693/k = 0.693/0.00693 = 100 s.'],
 ['The units of k for rate = k[A]² are:',['s⁻¹','mol L⁻¹ s⁻¹','L mol⁻¹ s⁻¹','L² mol⁻² s⁻¹'],2,'Dividing rate (mol L⁻¹ s⁻¹) by concentration squared leaves L mol⁻¹ s⁻¹.'],
 ['At fixed temperature, adding a catalyst to a reversible reaction changes:',['The equilibrium constant','The time needed to approach equilibrium','The standard reaction Gibbs energy','The equilibrium composition'],1,'A catalyst accelerates forward and reverse reactions without changing the equilibrium constant or equilibrium composition.']
 ],[
 ['What is the IUPAC name of CH₃CH₂CH(CH₃)CH₂CH₃?',['2-Methylpentane','3-Methylpentane','2-Ethylbutane','Hexane'],1,'The longest chain contains five carbons and the methyl substituent is on carbon 3.'],
 ['Which carbocation is least stable among these simple alkyl carbocations?',['CH₃⁺','CH₃CH₂⁺','(CH₃)₂CH⁺','(CH₃)₃C⁺'],0,'The methyl carbocation lacks stabilising alkyl-group hyperconjugation and the +I effect.'],
 ['Propan-1-ol and propan-2-ol show:',['Chain isomerism','Position isomerism','Geometrical isomerism','Optical isomerism'],1,'Both have the same carbon skeleton and functional group but the hydroxyl group occupies different positions.'],
 ['Which species is a nucleophile?',['NO₂⁺','BF₃','OH⁻','H⁺'],2,'Hydroxide donates an electron pair to an electrophilic centre and therefore acts as a nucleophile.']
 ],[
 ['Propene reacts with HBr in the presence of a peroxide. The major product is:',['1-Bromopropane','2-Bromopropane','1,2-Dibromopropane','Propane'],0,'The radical peroxide effect for HBr gives anti-Markovnikov addition, placing Br on the terminal carbon.'],
 ['In nitration of benzene, the attacking electrophile is:',['NO₂⁻','NO₂⁺','NH₄⁺','NO₃⁻'],1,'The nitrating mixture generates the nitronium ion, NO₂⁺, which attacks the aromatic ring.'],
 ['How many sigma and pi bonds are in ethene, C₂H₄?',['4 σ, 2 π','5 σ, 1 π','3 σ, 2 π','6 σ, 0 π'],1,'Four C–H bonds and the sigma part of C=C give five sigma bonds; the double bond also contains one pi bond.'],
 ['Which compound decolourises bromine water readily under ordinary conditions?',['Ethane','Propane','Propene','Methane'],2,'Propene contains a C=C double bond that undergoes addition with bromine. The listed alkanes do not react this way.']
 ],[
 ['Which reacts fastest by SN2 with the same nucleophile under comparable conditions?',['CH₃Br','CH₃CH₂Br','(CH₃)₂CHBr','(CH₃)₃CBr'],0,'The methyl substrate has the least steric hindrance, allowing the easiest backside attack in SN2.'],
 ['1-Chloropropane heated with aqueous KOH mainly gives:',['Propene','Propan-1-ol','Propan-2-ol','Propane'],1,'Aqueous hydroxide promotes nucleophilic substitution, replacing Cl with OH to form propan-1-ol.'],
 ['2-Bromobutane heated with alcoholic KOH predominantly gives:',['But-1-ene','But-2-ene','Butan-2-ol','Butane'],1,'Elimination favours the more substituted alkene under these conditions (Zaitsev’s rule), so but-2-ene is the major constitutional product.'],
 ['In the Finkelstein reaction using NaI in dry acetone, what helps drive the reaction forward?',['Dissolution of iodine','Precipitation of NaCl or NaBr','Formation of hydrogen gas','Neutralisation by water'],1,'NaCl and NaBr are poorly soluble in acetone and precipitate, favouring formation of the alkyl iodide.']
 ],[
 ['Ethanol heated with concentrated H₂SO₄ at about 413 K mainly gives:',['Ethene','Ethanal','Ethoxyethane','Ethanoic acid'],2,'At about 413 K, intermolecular dehydration of ethanol mainly forms diethyl ether (ethoxyethane).'],
 ['Which alcohol generally gives the slowest Lucas test at room temperature?',['Butan-1-ol','Butan-2-ol','2-Methylpropan-2-ol','2-Methylbutan-2-ol'],0,'Primary butan-1-ol reacts very slowly at room temperature. Secondary alcohols react faster and tertiary alcohols usually give immediate turbidity.'],
 ['Oxidation of butan-2-ol gives:',['Butanal','Butan-2-one','Butanoic acid','But-1-ene'],1,'A secondary alcohol oxidises to a ketone; the carbon bearing OH becomes the carbonyl carbon.'],
 ['How many moles of H₂ are formed when 2 mol ethanol reacts completely with excess sodium?',['0.5 mol','1 mol','2 mol','4 mol'],1,'The equation is 2C₂H₅OH + 2Na → 2C₂H₅ONa + H₂, so 2 mol ethanol forms 1 mol H₂.']
 ],[
 ['Which gives a silver mirror with Tollens’ reagent?',['Propanal','Butan-2-one','Propanone','Ethoxyethane'],0,'Propanal is an aldehyde and reduces Tollens’ reagent to metallic silver while it is oxidised.'],
 ['Which gives a positive iodoform test?',['Pentan-3-one','Butan-2-one','Benzaldehyde','Methanal'],1,'Butan-2-one contains the methyl ketone group CH₃CO–, which gives yellow iodoform (CHI₃).'],
 ['Which compound does NOT undergo self-aldol addition because it lacks α-hydrogens?',['Propanal','Butanal','Propanone','Benzaldehyde'],3,'Benzaldehyde has no hydrogen on the carbon adjacent to its carbonyl group and cannot form the required enolate for self-aldol addition.'],
 ['Reduction of butan-2-one with NaBH₄ followed by work-up gives:',['Butan-1-ol','Butan-2-ol','Butanal','Butanoic acid'],1,'A ketone reduces to a secondary alcohol. Butan-2-one therefore gives butan-2-ol.']
 ]
];
const VARIANTS=ALT_RAW.flatMap((rows,t)=>rows.map((r,i)=>({id:`v-${t}-${i}`,topic:t,pattern:`${t}-${i}`,prompt:r[0],options:r[1],answer:r[2],explanation:r[3]})));
const ALL_QUESTIONS=[...QUESTIONS,...VARIANTS];
if(typeof module!=='undefined')module.exports={ALT_RAW,VARIANTS};
