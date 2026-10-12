---
patch_id: PHY_F4_01
title: Electricity & Circuits
subject: Physics
form: 4
exam: MSCE
version: 1.0
---

# The Big Idea

Electricity is just **electrons moving through a wire**. When they move, they carry energy. If we control that movement with a circuit, we can light a bulb, run a phone, or cook nsima. **Every circuit is a loop — the current must have a path out and a path back.**

---

# Simple Explanation

Think of a **bicycle chain**. The pedals push the chain, the chain turns the wheel. If the chain breaks, nothing moves.

An electric circuit works the same way:
- **The battery** = your legs (pushes the electrons)
- **The wire** = the chain (carries them)
- **The bulb/motor** = the wheel (does the useful work)
- **The switch** = a brake that stops the chain

If any part breaks, the whole loop stops. That is why a broken bulb in a series circuit switches off the whole string.

### The three key quantities

| Quantity | Symbol | Unit | Meaning |
|---|---|---|---|
| Current | I | Ampere (A) | How much charge flows per second |
| Voltage | V | Volt (V) | The "push" given to the electrons |
| Resistance | R | Ohm (Ω) | How much the component slows the flow |

### Ohm's Law

$$V = I \times R$$

Rearranged:
- $I = V / R$
- $R = V / I$

### Series vs Parallel

**Series:** one path. Current is the same everywhere. Voltages add.
$$R_{total} = R_1 + R_2 + R_3$$

**Parallel:** many paths. Voltage is the same across each branch. Currents add.
$$\frac{1}{R_{total}} = \frac{1}{R_1} + \frac{1}{R_2} + \frac{1}{R_3}$$

### Electrical Power

$$P = V \times I$$

Also useful:
- $P = I^2 R$
- $P = V^2 / R$

Unit of power: **Watt (W)**. Energy used: $E = P \times t$ (in Joules, or kWh for bills).

---

# Key Points Box

- Current is **the same** everywhere in a series circuit.
- Voltage is **the same** across every branch in a parallel circuit.
- Ohm's Law: $V = IR$. Learn all three rearrangements.
- Series resistors **add up**.
- Parallel resistors always give a **smaller total** than the smallest one.
- Power: $P = VI$. Energy: $E = Pt$.
- Ammeters go **in series** with a component.
- Voltmeters go **in parallel** across a component.

---

# Worked Example

**Question:** A 12 V battery is connected to two resistors in series: $R_1 = 4\,\Omega$ and $R_2 = 8\,\Omega$. Find (a) total resistance, (b) current, (c) voltage across each resistor, (d) power used by $R_2$.

**Solution:**

**(a) Total resistance (series):**
$$R_{total} = R_1 + R_2 = 4 + 8 = 12\,\Omega$$

**(b) Current (Ohm's Law):**
$$I = \frac{V}{R} = \frac{12}{12} = 1\,\text{A}$$

**(c) Voltage across each resistor:**
- $V_1 = I \times R_1 = 1 \times 4 = 4\,\text{V}$
- $V_2 = I \times R_2 = 1 \times 8 = 8\,\text{V}$
- Check: $4 + 8 = 12\,\text{V}$ ✅ (matches the battery)

**(d) Power in $R_2$:**
$$P = V_2 \times I = 8 \times 1 = 8\,\text{W}$$

---

# Check Yourself

1. What is the unit of resistance?
2. In a series circuit, is the current the same or different at each point?
3. A 6 V battery drives 2 A through a resistor. What is its resistance?
4. Two 10 Ω resistors are in parallel. What is the total resistance?
5. Write Ohm's Law in three forms.

*(Answers at the end.)*

---

# Exam-Style Questions (MSCE)

**Q1.** A student connects three resistors of $2\,\Omega$, $3\,\Omega$, and $5\,\Omega$ in series to a 20 V supply. Calculate:
(a) the total resistance,
(b) the current in the circuit,
(c) the voltage across the $5\,\Omega$ resistor,
(d) the power dissipated in the $3\,\Omega$ resistor.

**Q2.** Two resistors, $R_1 = 6\,\Omega$ and $R_2 = 3\,\Omega$, are connected in parallel across a 12 V battery.
(a) Find the total resistance.
(b) Find the total current from the battery.
(c) Find the current through each resistor.
(d) Show that the currents add to your answer in (b).

**Q3.** Explain why the total resistance of resistors in parallel is always **less** than the smallest individual resistor.

**Q4.** An electric iron is rated **240 V, 1000 W**.
(a) Calculate the current it draws.
(b) Calculate its resistance.
(c) If used for 30 minutes, how much energy (in kWh) does it use?

**Q5.** A 12 V car battery is connected to a bulb of resistance $6\,\Omega$ and an ammeter. Draw the circuit, then calculate the current. Where must the ammeter be placed, and why?

---

# Answers

**Check Yourself:**
1. Ohm (Ω)
2. The same
3. $R = V/I = 6/2 = 3\,\Omega$
4. $1/R = 1/10 + 1/10 = 2/10$ → $R = 5\,\Omega$
5. $V = IR$, $I = V/R$, $R = V/I$

**Q1.**
(a) $R = 2 + 3 + 5 = 10\,\Omega$
(b) $I = 20/10 = 2\,\text{A}$
(c) $V = 2 \times 5 = 10\,\text{V}$
(d) $P = I^2 R = 2^2 \times 3 = 12\,\text{W}$

**Q2.**
(a) $1/R = 1/6 + 1/3 = 1/6 + 2/6 = 3/6$ → $R = 2\,\Omega$
(b) $I = 12/2 = 6\,\text{A}$
(c) $I_1 = 12/6 = 2\,\text{A}$; $I_2 = 12/3 = 4\,\text{A}$
(d) $2 + 4 = 6\,\text{A}$ ✅

**Q3.** In parallel, each resistor gives the current *another* path. More paths = easier flow = less overall resistance. The total can never be smaller than the smallest path alone; adding more paths only makes it easier still.

**Q4.**
(a) $I = P/V = 1000/240 \approx 4.17\,\text{A}$
(b) $R = V/I = 240/4.17 \approx 57.6\,\Omega$ (or $R = V^2/P = 57600/1000 = 57.6\,\Omega$)
(c) $E = P \times t = 1\,\text{kW} \times 0.5\,\text{h} = 0.5\,\text{kWh}$

**Q5.** Circuit: battery → ammeter → bulb → back to battery (series loop). $I = V/R = 12/6 = 2\,\text{A}$. The ammeter must be **in series** because it measures the current *through* a component — all the current must pass through it.

---

# Exam Tip

> Examiners love asking students to **compare series and parallel** in the same question. Always write down what stays the same:
> - Series → **current** is the same, **voltages add**
> - Parallel → **voltage** is the same, **currents add**
>
> Also: if your final answer has the wrong unit, you lose a mark even if the number is right. **Always write the unit.**

---

# Remember

**A circuit is a loop. No loop, no current. Ohm's Law is your friend: V = IR — and the two rearrangements must be automatic.**