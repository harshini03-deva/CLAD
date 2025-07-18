import pandas as pd

# Load the dataset
df = pd.read_csv('/content/Customer.csv')

# 1. Count of customers with CreditScore >= 800
cs = (df['CreditScore'] >= 800).sum()
print("Count of customers with CreditScore >= 800:", cs)

# 2. CustomerIds of female customers from Spain with CreditScore > 650
fdf = df[(df['Gender'] == 'Female') & (df['Geography'] == 'Spain') & (df['CreditScore'] > 650)]
print("CustomerIds of female customers from Spain with CreditScore > 650:\n", fdf['CustomerId'])

# 3. Surnames of customers who left (Exited == 1) without clearing their balance
sur_c = df[(df['Exited'] == 1) & (df['Balance'] > 0)]
print("Surnames of customers who left without clearing their balance amount:\n", sur_c['Surname'])

# 4. Surnames of male customers who left, earned > 100k, and cleared their balance
sur_mc = df[(df['Gender'] == 'Male') & (df['Exited'] == 1) & (df['EstimatedSalary'] > 100000) & (df['Balance'] == 0)]
print("Surnames of male customers who left, earned > 100k, and cleared their balance:\n", sur_mc['Surname'])

# 5. Compare activity levels of male and female customers in France
fc = df[df['Geography'] == 'France']
ma = fc[fc['Gender'] == 'Male']['IsActiveMember'].mean()
fa = fc[fc['Gender'] == 'Female']['IsActiveMember'].mean()

if ma > fa:
    print("Male customers exhibit higher activity levels.")
elif ma < fa:
    print("Female customers exhibit higher activity levels.")
else:
    print("Male and female customers exhibit equal activity levels.")

# 6. Geography with most customers under 30, have a credit card, and earn < $100,000
ghc = df.query("Age < 30 & HasCrCard == 1 & EstimatedSalary < 100000")
cg = ghc.groupby('Geography').size()
geo_hc = cg.idxmax()
print("Geography with more customers under 30 years old, using credit cards and earning less than $100,000:", geo_hc)
