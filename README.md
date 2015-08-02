# Alguito
Alguito is John and Jenniffer's retirement project.  We better figure out what it will do.  I'm still thinking time and billing, but also
project tracking.  There should be a full spec in the doc directory.

Anything here is preliminary at this point, so what we have to date is basically a virtual environment
with Eve, the Eve demo, plus support for static files.

# Time and Billing App (Specification -- First Try)

## Some Ideas / Competitors:

* [RocketMatter](https://www.rocketmatter.com/law-office-management-software/)
* [GetHarvest](https://www.getharvest.com)
* [Toggle](https://toggl.com)

## Concepts:

* Team -- this is our customer's employees or associates, the folks doing the billing
* People -- "Subclasses" (conceptually) are TeamPeople (aka Users) or ClientPeople
* Client -- This is a company (or person) which we bill for services
* Projects / Matters - a body of work that can be billed separately or used for tracking.  Related to Clients / ClientPeople.
* Timers (Description, plus 1-N dates and times.  Second precision but may need rounding rules for invoices?)
* "Billable" -- can be a project, a company, or a person.  
* Invoices, which consist of invoice lines and reference a billable.
* InvoiceItem:
	Is either a service or expense
	Assumption for services is rate * hours = amount.  May elect to show hours and rates on invoice or not.
	Contains a description of task (timer description), a short service title (e.g senior partner, designer, paralegal, etc.)
	Edit form contains simple checkbox to exclude or not, edit controls for everything else to adjust (hours etc.)
Rates:
	are either by Billable (client, project etc.) or by ServiceTitle (Senior Partner, Senior Partner Courtroom, etc.)
* Rates - can be per