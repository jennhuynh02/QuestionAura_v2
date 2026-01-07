"""
Seed script to populate the database with sample data.
Run: python seed_data.py [--reset]
"""
import sys
import argparse
from sqlalchemy import func, text
from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.topic import Topic
from app.models.question import Question
from app.models.answer import Answer

TOPICS = [
    {"id": 1, "name": "Programming", "image_url": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=400&fit=crop"},
    {"id": 2, "name": "Finance", "image_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop"},
    {"id": 3, "name": "Books", "image_url": "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=400&fit=crop"},
    {"id": 4, "name": "Criminology", "image_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop"},
    {"id": 5, "name": "Philosophy", "image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"},
    {"id": 6, "name": "Nature", "image_url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop"},
    {"id": 7, "name": "Psychology", "image_url": "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop"},
    {"id": 8, "name": "Music", "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop"},
    {"id": 9, "name": "Career", "image_url": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=400&fit=crop"},
    {"id": 10, "name": "Technology", "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop"},
    {"id": 11, "name": "Art", "image_url": "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop"},
    {"id": 12, "name": "History", "image_url": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop"},
]

USERS = [
    {"id": 1, "first_name": "Demo", "last_name": "User", "email": "demo@questionaura.com", "auth0_id": "demo-user-12345"},
    {"id": 101, "first_name": "Guest", "last_name": "User", "email": "guestuser@questionaura.com", "auth0_id": "seed-user-101"},
    {"id": 102, "first_name": "Isaac", "last_name": "Newdon", "email": "isaacstein@gmail.com", "auth0_id": "seed-user-102"},
    {"id": 103, "first_name": "Wayne", "last_name": "Brazy", "email": "allthewayne@yahoo.com", "auth0_id": "seed-user-103"},
    {"id": 104, "first_name": "James", "last_name": "Bands", "email": "jayjames@hotmail.com", "auth0_id": "seed-user-104"},
    {"id": 105, "first_name": "Darrick", "last_name": "Yawns", "email": "imthedad@me.com", "auth0_id": "seed-user-105"},
    {"id": 106, "first_name": "Miguel", "last_name": "Juan", "email": "jmiggs@hello.com", "auth0_id": "seed-user-106"},
    {"id": 107, "first_name": "Chef", "last_name": "Lean", "email": "shaphen@gmail.com", "auth0_id": "seed-user-107"},
    {"id": 108, "first_name": "Charles", "last_name": "Choose", "email": "charles@dude.com", "auth0_id": "seed-user-108"},
    {"id": 109, "first_name": "Michael", "last_name": "Murr", "email": "michael@hello.com", "auth0_id": "seed-user-109"},
    {"id": 110, "first_name": "Ray", "last_name": "Gee", "email": "gin@hey.com", "auth0_id": "seed-user-110"},
    {"id": 111, "first_name": "Jenn", "last_name": "Wynn", "email": "jenjen@hello.com", "auth0_id": "seed-user-111"},
    {"id": 112, "first_name": "David", "last_name": "Fam", "email": "david@gmail.com", "auth0_id": "seed-user-112"},
]

QUESTIONS = [
    {"id": 201, "ask": "What's the best strategy for becoming better at solving algorithms?", "asker_id": 106, "topic_id": 1, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795559/https_3A_2F_2Fsubstack-post-media.s3.amazonaws.com_2Fpublic_2Fimages_2F1a0b096f-b3ee-4585-9583-02066a15455d_5320x3324_ksmw35.png"},
    {"id": 202, "ask": "How do I help myself better understand recursions?", "asker_id": 101, "topic_id": 1, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795481/maxresdefault_zk9vb1.jpg"},
    {"id": 203, "ask": "What are some useful websites or applications for financial health?  I'm looking for tools for investing and managing my finances.", "asker_id": 105, "topic_id": 2, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795600/1520129303511_zhnuey.jpg"},
    {"id": 204, "ask": "What is your best and worst purchase?", "asker_id": 102, "topic_id": 2, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795655/buyer-decision-process-in-five-phases_qcuioj.png"},
    {"id": 205, "ask": "What is your favorite science fiction book?", "asker_id": 104, "topic_id": 3, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795693/71gTxlFcItL._AC_UF1000_1000_QL80__fwochv.jpg"},
    {"id": 206, "ask": "Name a book were you required to read in high school?", "asker_id": 103, "topic_id": 3, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795719/The_Catcher_in_the_Rye__281951_2C_first_edition_cover_29_gxdapv.jpg"},
    {"id": 207, "ask": "What factors lead to the mass incarceration of American citizens?", "asker_id": 103, "topic_id": 4, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795742/e28a6b_ac2f452dc90a42e09910fc37419c401f_mv2_gp8z9d.png"},
    {"id": 208, "ask": "What is white collar crime?", "asker_id": 104, "topic_id": 4, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795787/white-collar-crime_h3ewdn.jpg"},
    {"id": 209, "ask": "Can you share some philosophical quotes?", "asker_id": 102, "topic_id": 5, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795872/Qblqd67_fss6sz.jpg"},
    {"id": 210, "ask": "Who are some famous philosophers?", "asker_id": 105, "topic_id": 5, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796151/71SIAfn6f6L._AC_UF1000_1000_QL80__f48szv.jpg"},
    {"id": 211, "ask": "Where is a good place to go hiking?", "asker_id": 101, "topic_id": 6, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767795921/1200px-Chimney_Rock_Trail_Point_Reyes_December_2016_panorama_1_ugwptx.jpg"},
    {"id": 212, "ask": "Name an interesting natural phenomenon?", "asker_id": 106, "topic_id": 6, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796201/71386_z9h5ik.jpg"},
    {"id": 213, "ask": "What famous psychology experiments have been conducted?", "asker_id": 107, "topic_id": 7, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796322/Guards-prisoner-Phillip-Zimbardo-Stanford-Prison-Experiment_xsxnht.jpg"},
    {"id": 214, "ask": "What causes addiction?", "asker_id": 112, "topic_id": 7, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796286/Dopamine-Addiction-Symptoms-Causes-and-How-to-Overcome-It_g4eq24.webp"},
    {"id": 215, "ask": "Name some famous EDM artists?", "asker_id": 108, "topic_id": 8, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796350/maxresdefault_cxmqxg.jpg"},
    {"id": 216, "ask": "Can you name some popular indie music artists?", "asker_id": 111, "topic_id": 8, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796401/tame-impala-lead-photo_qfhmz3.jpg"},
    {"id": 217, "ask": "What are some of the best tech companies to work for in terms of: culture, career growth, salary, perks, etc.?", "asker_id": 109, "topic_id": 9, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796690/GAFA-Big-Tech_v7d6pc.jpg"},
    {"id": 218, "ask": "What was your experience like at App Academy?  Why did you attend and was it worth it?", "asker_id": 110, "topic_id": 9, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796736/5faae1191b673c881b077e1f_ogaa-min_x2rgum.png"},
    {"id": 219, "ask": "When was the first electric car made?", "asker_id": 110, "topic_id": 10, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796757/filters_3Aquality_2870_29_kk7cwj.jpg"},
    {"id": 220, "ask": "What is Question Aura?", "asker_id": 109, "topic_id": 10, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767797652/IMG_0930_yazcjk.png"},
    {"id": 221, "ask": "What is surrealism?", "asker_id": 111, "topic_id": 11, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796624/the-persistence-of-memory-1931-1140x867_l22qtc.jpg"},
    {"id": 222, "ask": "What are uncommon forms art?", "asker_id": 108, "topic_id": 11, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796586/1965marcel-duchamp_new-scan_g_11.jpg_mxvn7a.jpg"},
    {"id": 223, "ask": "What are some of the most memorable wars?", "asker_id": 112, "topic_id": 12, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796493/US-Marines-bombing-bunkers-tunnels-Viet-Cong-1966_yds3dk.jpg"},
    {"id": 224, "ask": "What wars involved parties in the same country?", "asker_id": 107, "topic_id": 12, "image_url": "https://res.cloudinary.com/dcxc34rid/image/upload/v1767796554/civil-war-gettyimages-3427284_vbqzyw.jpg"},
]

ANSWERS = [
    {"id": 301, "responder_id": 112, "question_id": 201, "response": "Studying data structures (linked lists, trees, hash maps, arrays, tries, etc.) and sorting/search algorithms (radix sort, heap sort, merge sort, quick sort, bubble sort, bSearch, graph traversal etc.) will help you understand and solve algorithm problems much better.  Data structures and methodologies such as dynamic programming, memoization, and tabulation can be used in your algorithm implementation for optimal time and space complexity."},
    {"id": 302, "responder_id": 107, "question_id": 201, "response": "Practice makes perfect. A great platform to practice your algorithmic problem solving skills is on Leetcode.  You can find over 1,500 problems to solve on there, test your solutions, view other peoples' approaches, and discuss different strategies.  If you're new to coding, you should start working on the easy ones but be sure to try medium and hard questions as you go along."},
    {"id": 303, "responder_id": 111, "question_id": 202, "response": "A good strategy for understanding recursions is to draw out each recursive step stack frame as it is being called, till it hits the base case.  You can also use a print statement, such as Console.log (javascript), to help you visualize these stack frames in your console.  By doing this, you can see what value is being returned at each recursive step to see how it helps to achieve the result you are looking for."},
    {"id": 304, "responder_id": 108, "question_id": 202, "response": "When first attempting to solve a problem recursively, you will need to consider the two parts that recursions are comprised of:  1) the base case and 2) the subproblem that the recursion solves, also known as the recursive step.  Identify the smallest step the recursion will handle before it reaches the base case - which is the step that will be called again and again, solving portions of the problem until it reaches the base case.  The return value at the base case will be returned to each preceding step that has called it, to return your entire result.  You can think of it as a factory attempting to produce 1,000 yards of linen.  To produce 1,000 yards of linen, the factory will produce one yard at a time, 1,000 times.  Once it reaches 1,000, it can then finally attach all the linen pieces together, starting at the last linen that was produced until it reaches the first linen that was made.  When we cycle back to the first linen that was created, we should have a resulting 1,000 yard long linen."},
    {"id": 305, "responder_id": 110, "question_id": 203, "response": "Credit Karma, Experian, and Transunion will let you check your credit score as well as dispute any false or inaccurate information for free anytime on their online platform; this can help you monitor and improve your credit score overtime.  Credit health is very important when attempting to apply for credit cards, auto loans, and mortgages; excellent scores will offer benefits and perks that may help to serve your financial goals in the long run."},
    {"id": 306, "responder_id": 109, "question_id": 203, "response": "There are many applications for investing your money; popular ones include RobinHood, TD Ameritrade, Stash, Acorns, and YouInvest by J.P. Morgan.  Depending on your current situation and future goals, you may find that one application better suits your needs than another.  RobinHood allows for fast day trading, while TD Ameritrade may be more useful for long-term holds."},
    {"id": 307, "responder_id": 111, "question_id": 204, "response": "My best purchase was my education - it was an investment in myself that will have benefited me in many unexpected ways.  Having majored in Criminology, Sociology, and Law, as well as Psychology and Social Behavior at the University of California, Irvine has helped me to better understand myself, and the people around me.  Also, living on my own in a different place than where I grew up, gave me the life experience and necessary skills that I would use to overcome later challenges in my life and has also equipped me with the knowledge that I now have to help myself and others around me in social and working environments."},
    {"id": 308, "responder_id": 110, "question_id": 204, "response": "My worst purchase would probably include all of my designer products that I've spent thousands of dollars on - In retrospect, I think I wore them to fit in and stand out; to impress people.  I later on in my life realized that the people who genuinely liked me were those who didn't really care if I had these unnecessary, experience material things - they just wanted to get to know me for who I am and to spend time with me, which didn't really cost anything.  Also, those designer things tend to lose value over time as newer products are released, thus becoming a depreciating asset."},
    {"id": 309, "responder_id": 108, "question_id": 205, "response": "Uglies - Scott Westerfeld.  This book takes places in a technologically-advanced dystopian society where people, at the age of 16, undergo cosmetic surgery to become aesthetically beautiful as a rite of passage into a perfect life where everyone socializes and parties, and has little to no obligations.  While this life may seem ideal, there are some rebels who choose to leave this society to live on their own, perfectly imperfect.  This book is part 1 of a 3 part series.  The technologies introduced in this book are the most appealing as they are very futuristic thinking."},
    {"id": 310, "responder_id": 111, "question_id": 205, "response": "The Last Book In The Universe by Rodman Philbrick.  This cyberpunk action novel is set in a futuristic time in which the world has been almost completely destroyed.  The remaining people are hooked to technological forms of disillusionments to distract themselves from the chaos in which they live.  I find this book intense, thrilling, and thought-provoking."},
    {"id": 311, "responder_id": 107, "question_id": 206, "response": "The Catcher in the Rye - J.D. Salinger"},
    {"id": 312, "responder_id": 112, "question_id": 206, "response": "Lord of the Flies - William Golding"},
    {"id": 313, "responder_id": 106, "question_id": 207, "response": "Factors that contributed to mass incarceration included:  poverty, poor educational systems, crimes in lower-socioeconomic neighborhoods, and gang influence.  With lack of support for the poor to fend for themselves, crime became a rampant means of survival."},
    {"id": 314, "responder_id": 101, "question_id": 207, "response": "The war on drugs (such as laws against marijuana) contributed to the introduction of many citizens into the legal justice system (even for small amounts of possession).  This made it hard for many people to get jobs and climb out of the life of crime.  When parents were unable to support their children due to being incarcerated, their children were also affected and had a high likelihood of ending up in the system themselves."},
    {"id": 315, "responder_id": 105, "question_id": 208, "response": "White collar crimes are financially, non-violent motivated crimes.  Examples of this include embezzlement, money laundering, bribery, and tax evasion."},
    {"id": 316, "responder_id": 102, "question_id": 208, "response": "Famous example cases of white-collar crime include: Enron, Wells Fargo, WorldCom, Bernard Madoff, and Jordan Ross Belfort (Wolf of Wall Street guy)."},
    {"id": 317, "responder_id": 104, "question_id": 209, "response": "Even while they teach, men learn - Seneca the Younger"},
    {"id": 318, "responder_id": 103, "question_id": 209, "response": "Only one man ever understood me, and he didn't understand me - G.W.F Hegel"},
    {"id": 319, "responder_id": 103, "question_id": 210, "response": "Socrates was an Athenian philosopher who believed in self-development over focus on material gain. "},
    {"id": 320, "responder_id": 104, "question_id": 210, "response": "Confucius, he, who focuses on cultivation of virtue in a morally organized world."},
    {"id": 321, "responder_id": 102, "question_id": 211, "response": "Lake Chabot in San Leandro has a nice, flat trail to stroll around the lake.  You can go paddle boating and fishing there as well."},
    {"id": 322, "responder_id": 105, "question_id": 211, "response": "Mission Peak in Fremont, California is infamous for its intensity - make it to the top and take can a picture at the famous pole!"},
    {"id": 323, "responder_id": 101, "question_id": 212, "response": "Underwater rivers - they form when fresh water sits on top of dense salt water."},
    {"id": 324, "responder_id": 106, "question_id": 212, "response": "Glowing lights in the sea; they're actually bioluminescent organisms swimming around!"},
    {"id": 325, "responder_id": 112, "question_id": 213, "response": "The Stanford prison experiment, conducted by professor Philip Zimbardo, explored the psychological effects of perceived power.  Students were paid to take role as either a guard or a prisoner.  In this controlled environment, the young men were watched as they played their assigned roles.  The findings were very shocking, as abuse started to take place.  The guards acted as though that they were guards and that the prisoners were actual criminals.  The students, who played as the prisoners, were psychologically tortured, some beyond repair.  Since then, the American Psychology Association had made great strides towards ethical psychological research studies."},
    {"id": 326, "responder_id": 107, "question_id": 213, "response": "The Milgram experiment, conducted by Stanley Milgram, studied internal conflict between obedience to authority and personal conscience in people.  Participants were instructed to deliver electrical shocks to an unknown person; the researcher wanted to see whether they participants would stop or continue, in spite of the perceived pain they were inducing on their victims.  Findings were shocking, as some obeyed to deliver deadly shocks despite hearing the victims' cries."},
    {"id": 327, "responder_id": 109, "question_id": 214, "response": "Addictions can stem from a combination of psychological, biological, and social factors.  Psychologically, mental illnesses such as depression and anxiety can result in poor coping mechanisms.  Biologically speaking, impulsivity and a lack of control can cause one to try to negative behavior and continue it as a habit.  Socially, environments can create easier access to the habit, influence that behavior, or trigger repeated behaviors."},
    {"id": 328, "responder_id": 108, "question_id": 214, "response": "Peoples' social environment - people are introduced to substances by their peers and obtain them from available sources in their environment.  What started off as socializing fun becomes a lifestyle habit - eventually an addiction.  If recreational drugs weren't available, it would be much harder for people to become addicted to what is not there."},
    {"id": 329, "responder_id": 110, "question_id": 215, "response": "Kaskade, Zedd, Martin Garrix, 3lau, Alesso, and Swedish House Mafia."},
    {"id": 330, "responder_id": 109, "question_id": 215, "response": "Avicii, Deorro, Tritonal, Afrojack, Above & Beyond, and Dash Berlin."},
    {"id": 331, "responder_id": 109, "question_id": 216, "response": "SG Lewis, Clairo, and Tame Impala."},
    {"id": 332, "responder_id": 110, "question_id": 216, "response": "Joji, FKJ, Jeremy Zucker, Honne."},
    {"id": 333, "responder_id": 108, "question_id": 217, "response": "The best tech companies to work for are in San Francisco and Silicon Valley - companies include Google, Facebook, Square, Splunk, DoorDash, Samsara, Salesforces, and other startups that value a good culture."},
    {"id": 334, "responder_id": 111, "question_id": 217, "response": "Startups are a good place to work if you like a fast-paced work environment.  Some developers prefer startups over a FAANG company as their work carries more impact.  Having a smaller team requires people who can wear many hats and produce a lot of work."},
    {"id": 335, "responder_id": 107, "question_id": 218, "response": "App Academy was a very intense and rewarding experience.  I attended this program to further my programming skills and code with others.  It was worth it, as I soon got my dream job after!   Pair programming was an important aspect of App Academy.  While it's scary to work with someone new everyday, it hones your ability to speak code and work and learn well with others."},
    {"id": 336, "responder_id": 112, "question_id": 218, "response": "I attended App Academy because I was interested in learning how to code and becoming a great programmer.  I learned how to code in Ruby and Javascript, as well as use other technologies (like database storage with PostgreSQL & MongoDB).  I've made a lot of great friends and learned a lot while I was in the program.  I would highly recommend this program to anyone who is serious about learning to code and becoming a programmer."},
    {"id": 337, "responder_id": 106, "question_id": 219, "response": "In 1832, it was developed by Robert Anderson.  It was first successfully made in 1890 by William Morrison."},
    {"id": 338, "responder_id": 101, "question_id": 219, "response": "Tesla was the first company to mass produce electric cars.  While not the first, it was the first successful company that made electric cars common."},
    {"id": 339, "responder_id": 105, "question_id": 220, "response": "Question Aura is web application that serves as a question and answer online forum.  It was an inspired clone of the author programmer's favorite website - Quora."},
    {"id": 340, "responder_id": 102, "question_id": 220, "response": "It's a clone of Quora which uses Ruby on Rails in the backend, PostgreSQL to house the database, and React / Redux Javascript for the frontend."},
    {"id": 341, "responder_id": 104, "question_id": 221, "response": "Surrealism is an avant-garde cultural movement that sought to release the creativity of the unconsconscious mind in artworks.  Surrealism themes includes juxstaposition of uncommon imagery."},
    {"id": 342, "responder_id": 103, "question_id": 221, "response": "Famous surrealist artists include Pablo Picasso, Frida Kahlo, Rene Magritte, and Salvador Dali.  For example, The Persistence of Memory by Salvador Dali, 1931."},
    {"id": 343, "responder_id": 103, "question_id": 222, "response": "Marina Abramovic and Ulay were performance artists that used their body as a medium to covey to their audience limitations of the body and possibilities of the mind.  In once famous performance, Marina stood in a room still for 6 hours and invited people to come to her and do as they pleased.  She wanted to see how people reacted to her when she stood there lifeless, and their reaction when she moved like a human.  The performance was breathtaking, as her impact on her audience was noticeably profound."},
    {"id": 344, "responder_id": 104, "question_id": 222, "response": "Bicycle Wheel by Marcel Duchamp, 1913/. It was a sculpture made of a wood stool and bicycle wheel.  The idea was that anything can be made and interpreted as art, even readymade items put together."},
    {"id": 345, "responder_id": 102, "question_id": 223, "response": "World War II (1939-1945, many countries were involved and there is an estimate of 70 million deaths."},
    {"id": 346, "responder_id": 105, "question_id": 223, "response": "The War in Afganistan - this took place after the 9/11 attacks and is a war against terrorism."},
    {"id": 347, "responder_id": 101, "question_id": 224, "response": "The Vietnam War, also known as the Second IndoChina War, took place when the communist regime aimed to take over the Southern part of Vietnam. The American soldiers tried to help but were unable to do so due to Vietnam's geography. The terrain made guerilla warfare possible, the Viet Cong used this warfare strategy to their advantage and eventually won the war."},
    {"id": 348, "responder_id": 106, "question_id": 224, "response": "The Korean war between North and South Korea.  The two countries remain divided till this day."},
]


def reset_database(db):
    """Drop and recreate all tables."""
    print("Resetting database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database reset complete.\n")


def seed_topics(db):
    """Seed topics and return id mapping."""
    print("Seeding topics...")
    id_map = {}
    created = 0
    
    for data in TOPICS:
        existing = db.query(Topic).filter(Topic.id == data["id"]).first()
        if existing:
            id_map[data["id"]] = existing
        else:
            topic = Topic(**data)
            db.add(topic)
            id_map[data["id"]] = topic
            created += 1
    
    db.flush()
    print(f"  Created {created} topics")
    return id_map


def seed_users(db):
    """Seed users and return id mapping."""
    print("Seeding users...")
    id_map = {}
    created = 0
    
    for data in USERS:
        existing = db.query(User).filter(User.id == data["id"]).first()
        if existing:
            id_map[data["id"]] = existing
        else:
            user = User(**data)
            db.add(user)
            id_map[data["id"]] = user
            created += 1
    
    db.flush()
    print(f"  Created {created} users")
    return id_map


def seed_questions(db, topic_map, user_map):
    """Seed questions and return id mapping."""
    print("Seeding questions...")
    id_map = {}
    created = 0
    
    for data in QUESTIONS:
        existing = db.query(Question).filter(Question.id == data["id"]).first()
        if existing:
            id_map[data["id"]] = existing
        else:
            if data["topic_id"] not in topic_map or data["asker_id"] not in user_map:
                continue
            question = Question(
                id=data["id"],
                topic_id=topic_map[data["topic_id"]].id,
                ask=data["ask"],
                asker_id=user_map[data["asker_id"]].id,
                image_url=data.get("image_url")
            )
            db.add(question)
            id_map[data["id"]] = question
            created += 1
    
    db.flush()
    print(f"  Created {created} questions")
    return id_map


def seed_answers(db, question_map, user_map):
    """Seed answers."""
    print("Seeding answers...")
    created = 0
    
    for data in ANSWERS:
        existing = db.query(Answer).filter(Answer.id == data["id"]).first()
        if existing:
            continue
        if data["question_id"] not in question_map or data["responder_id"] not in user_map:
            continue
        answer = Answer(
            id=data["id"],
            question_id=question_map[data["question_id"]].id,
            response=data["response"],
            responder_id=user_map[data["responder_id"]].id,
            image_url=None
        )
        db.add(answer)
        created += 1
    
    db.flush()
    print(f"  Created {created} answers")


def reset_sequences(db):
    """Reset database sequences."""
    try:
        max_topic_id = db.query(func.max(Topic.id)).scalar() or 0
        max_user_id = db.query(func.max(User.id)).scalar() or 0
        max_question_id = db.query(func.max(Question.id)).scalar() or 0
        max_answer_id = db.query(func.max(Answer.id)).scalar() or 0
        
        db.execute(text(f"SELECT setval('topics_id_seq', {max_topic_id + 1}, false)"))
        db.execute(text(f"SELECT setval('users_id_seq', {max_user_id + 1}, false)"))
        db.execute(text(f"SELECT setval('questions_id_seq', {max_question_id + 1}, false)"))
        db.execute(text(f"SELECT setval('answers_id_seq', {max_answer_id + 1}, false)"))
    except Exception:
        pass  # Sequences may not exist yet


def main():
    parser = argparse.ArgumentParser(description="Seed the database")
    parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    args = parser.parse_args()
    
    db = SessionLocal()
    
    try:
        if args.reset:
            confirm = input("This will delete all data. Continue? (yes/no): ")
            if confirm.lower() != "yes":
                print("Aborted.")
                return
            reset_database(db)
        
        topic_map = seed_topics(db)
        user_map = seed_users(db)
        question_map = seed_questions(db, topic_map, user_map)
        seed_answers(db, question_map, user_map)
        reset_sequences(db)
        
        db.commit()
        print("\nSeeding complete!")
        
    except Exception as e:
        db.rollback()
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
