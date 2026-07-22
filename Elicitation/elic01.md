# BOOK MY SHOW

# Problem
``` txt
Usecase:Event Registration System

Title: Design Event Registration application

Requirements: There are three roles: organizers, registrants, admin.

Admin has all the privileges. 
Organizers have all the privileges related to organized events. 
Organizers can add/update/delete events with details like name, dates, max participants per registration, id proof required and status etc.
Organizers can list out all the events with filtering parameters like name, date, venue, entry fees etc.

Registrants can fill registration details.
Registrants will select a payment method.
Registrants can pay registration fees if applicable via select payment modes.
Registrants can print out event registration receipts.

Event registration status
    Open: Registration allowed.
    Closed: Registration for a given event is closed and not allowed.
```


# Order
- Business Understanding
- User Roles
- Event Lifecycle
- Registration Flow
- Payment Flow
- Administration
- Notifications
- Reports
- Non-functional Requirements
- Future Scope
- Constraints
- Wrap Up

# IMP->caveats at the end

```txt
I am thinking event can be anything: ONLINE/OFFILE/HYBRID, even an HIRING can be EVENT

Event could be concert, Hiring, Tech-events
Req -> vary

Will discuss more on this
```

# P1: Business understanding
- What problem are you trying to solve?
- How do you currently manage event registrations?
- Why isn't the current process sufficient?
- What takes the most time today?

What KPIs you expect that would be improved after this (and after what duration)

### Priority / MVP scope — If we could only ship 3 things in v1, what would they be?" Reason: I dont need wishlist, I need scope.

multi-tenent
- own events



#
# Getting technical here
# p2 stakeholders
- there are admin/organizer/user mentioned. Are there any other users as well (open user/without login)
#
  ### Walk me through what a each user(A/O/R) does from opening the application until entering the event.

- can admin perform absolutely everything(crud user/event)

- can organizer:
    - Create unlimited events?
    - Edit event after registrations begin?
    - Delete event?
    - Close registrations?
    - Cancel event?
    - View participants?
    - Download participant list?
    - Mark attendance?
    - Scan QR codes?

#
- can registrant:
    - Register without account?
    - Login?
    - Register multiple people?
    - Edit registration?
    - Cancel registration?
    - Request refund?
    - Register for multiple events? (I feel obvious, need clients POV)
    - Upload documents?


### Approval workflow: does organizer needs admin's approval to make event visible

#

### Event Lifecycle:
### - Need thorough explaination on what Event lifecycle does Sameer Sir thinks of
### - Draft -> Published -> Open -> Registration Closed -> Completed -> Archived

# part 3: event details

- What event this could be : ONLINE/OFFLINE/HYBRID(taking place offline and people connect online)

- Event status: Currently mentioned open and close
  - Can events also become:
    Draft
    Completed

- capacity, fixed or not



# P4: Registration (caveats)

- CAN ORGANIZER CUSTOMIZE REGISTRATION FIELDS (some need collegeId, another needs resume) : No need

- What about group registrations:
  - one person book multiple regis.
  - corporate regis
  - college teams, etc

  - Duplicate registrn

  - **waiting list (if regis > cap, where to put registrant, cancel or waiting)**


#
# P5: payments
- payment gw integration
- cash
- can event be free?
- need of invoices?


#
# P6: documents: No need
- mentioned: ID PROOF REQ
  - which ids?
  - who verifies id (auto/manual)




#
# p7 seach and filters:
### - case sensitive? starts with? ...
  - apart from already mentioned: Name
    Venue Date Entry fees
  - Anything else? Category? Organizer? Status? Available seats?


<!-- --- v0 covered till here -->

#
# Notification
- Should system send
    - Email
    - SMS
    - WhatsApp 
    - Push notification

- when to send: on payment, cancellation, updated, etc...

#
# receipt

- only receipt was mentioned
    - what should it contain?
    - QR, GST details, pdf download
- receipt mail?

 -no dashboard

#
# Admin dashboard
- What statistics are important?
- Example:
    - Total events
    - Upcoming events
    - Revenue
    - Participants
    - Payment success rate
    - Most popular event: No rating system

#
# P11: Reports
- Export reports? (organuizer/admin)
    - csv, excel, pdf, etc
- What decisions do reports help you make?

- 2 reports: month wise and catagory for each, admin to create each moth bar chart
secondly: for a custom period: pie chart, number of events catagory wise
bar and pie chart must be adjacently visible
last 6 moths as default pie and bar for 6 months


# Security
 - Need login?
    - Google login?
    - OTP?
    - Email verification?
    - Password reset? 
    - 2FA?

#
# p16: performance
- max expected
    - Registrations? 
    - Concurrent users?
    - Peak registrations?

#
# p17 Devices supportd
- devices supported
- if yes, need responsive design for sure.


# p18 Future scope
- Examples
 - QR check-in
 - Attendance
 - Promo codes -> this system, org can decide, 
 - Event feedback
 - Ratings
 - Live streaming
 - Sponsor management

<!-- # pure business oriented   -->
#
# P19 contraints
- timeline
- budget

#
# P20 Integrations
- Need integration with

    - Payment gateway
    - Email
    - SMS
    - Google Calendar
    - Zoom


#
# Extra

- Coupons: 
- Will there ever be
    Coupons,
    Discount codes,
    Early bird pricing

- Recurring Events: No recurring event
  - E.g. Weekly Yoga for 6 months: treat as:
    - 1 event
    - 1 events a month
    - new event every time


- Timezones (diff countries/India)


- Audit Logs: Who edited entries

- Soft delete: If organizer deletes event:
    - hard delete OR archive


- Data retention: Do registrations stay forever?

- Privacy

- Since IDs are stored:
Who can download them?
Can organizer?
Only admin?
Should they expire?

# Anything I didn't ask but was expected and is critical

# Important caveats:
1. Organizer edits event capacity down while registrations are open (e.g., 100 → 50, but 70 already registered) - what happens to the extra 20? : Cant downsize in this case

2. Partial cancellation — group of 5 registers
can 2 cancel, or entire group needs to cancel
(Initial Redbus days example): No cancellation


### IMP for security
1. Group registration where 1 of 5 members' ID proof is rejected — does the whole group get blocked, or just that member?: Not our hastle

2. Waitlist promotion: FCFS?

3. Event published, then organizer wants tochange date/venue — does this require re-confirmation from already-registered participants?



#### 6. Waitlist + partial cancellation interaction: capacity 100, 100 registered, 10 on waitlist. One person from the confirmed 100 cancels 3 seats (was a group of 3). Does the waitlist get offered exactly 3 seats, and if the top waitlisted group needs 5, do they get skipped in favor of a smaller group, or does everything block until they respond?

# IMP caveat
### - Partial registration:
    capacity = 100
    registered = 98
    someone tries to register with 5 people
    
    - waiting to all
    - register 2, 3 waiting
    - register none

-------------------

v1: 

Single paymeny gw : RP
Race conditions:

2 groups: A: 3 people, B: 5 people, 95 seats are filled : business

- user applies a filter on a page and then on clicking somehting, gets redirected to another page, after coming to root page, those filters must persist

### Many events need certificate of completion
### - PDf?
