-- China Deep Travel 测试数据
-- 执行前请先运行 db/schema.mysql.sql 创建表结构

USE cpt;

-- ============================================================
-- 0. Reference data (categories, packages, ad slots)
-- ============================================================

INSERT INTO categories (id, name, slug, sort_order) VALUES
('cat-001', 'Beijing & North', 'beijing-north', 1),
('cat-002', 'Shanghai & East', 'shanghai-east', 2),
('cat-003', 'Silk Road & West', 'silk-road-west', 3),
('cat-004', 'Yunnan & Southwest', 'yunnan-southwest', 4),
('cat-005', 'Sichuan & Central', 'sichuan-central', 5),
('cat-006', 'Nature & Scenic', 'nature-scenic', 6);

INSERT INTO point_packages (id, name, price_usd, points_amount, bonus_points, badge, sort_order, is_active) VALUES
('pkg-001', 'Starter Pack', 5.00, 150, 0, NULL, 1, 1),
('pkg-002', 'Explorer Pack', 15.00, 510, 60, 'Explorer', 2, 1),
('pkg-003', 'Adventurer Pack', 30.00, 1080, 180, 'Adventurer', 3, 1),
('pkg-004', 'Nomad Pack', 60.00, 2280, 480, 'Nomad', 4, 1);

INSERT INTO ad_slots (id, slot_code, slot_name, width, height, position) VALUES
('adslot-001', 'homepage-banner', 'Homepage Banner', 728, 90, 1),
('adslot-002', 'homepage-sidebar', 'Homepage Sidebar', 300, 250, 2),
('adslot-003', 'article-top', 'Article Top', 728, 90, 3),
('adslot-004', 'article-sidebar', 'Article Sidebar', 300, 600, 4),
('adslot-005', 'footer-banner', 'Footer Banner', 728, 90, 5),
('adslot-006', 'mobile-notif', 'Mobile Notification', 320, 50, 6);

-- 清空现有数据（保留管理员和套餐）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE point_transactions;
TRUNCATE TABLE user_unlocked_articles;
TRUNCATE TABLE articles;
TRUNCATE TABLE orders;
TRUNCATE TABLE advertisements;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 保留种子数据（从 schema.mysql.sql）
-- admin@chinadeeptravel.com / Admin#2024
-- 4 个 point_packages
-- 6 个 ad_slots

-- ============================================================
-- 1. 测试用户（10 个）
-- ============================================================

INSERT INTO users (id, email, password_hash, name, current_points, role, created_at) VALUES
-- 用户 1: 充足积分用户
('user-001', 'john.traveler@gmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'John Smith', 850, 'user', DATE_SUB(NOW(), INTERVAL 30 DAY)),

-- 用户 2: 普通用户
('user-002', 'sarah.wanderer@outlook.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Sarah Johnson', 320, 'user', DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- 用户 3: 积分不足用户
('user-003', 'mike.explorer@yahoo.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Mike Chen', 8, 'user', DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- 用户 4: 活跃用户
('user-004', 'emma.adventures@gmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Emma Wilson', 1250, 'user', DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- 用户 5: 新用户
('user-005', 'david.newbie@protonmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'David Lee', 20, 'user', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- 用户 6-10: 其他测试用户
('user-006', 'lisa.curious@gmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Lisa Brown', 180, 'user', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('user-007', 'tom.backpacker@yahoo.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Tom Davis', 95, 'user', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('user-008', 'anna.photographer@gmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Anna Martinez', 420, 'user', DATE_SUB(NOW(), INTERVAL 18 DAY)),
('user-009', 'kevin.foodie@outlook.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Kevin Wang', 275, 'user', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('user-010', 'jenny.culture@gmail.com', '$2a$12$ph66d7dMPb3V1XyBrt3/muGu9KENiWwlym6Ve/02ePn2a5z6iXkPK', 'Jenny Liu', 640, 'user', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================================
-- 2. 攻略文章（20 篇，覆盖 6 大分类）
-- ============================================================

-- 北京分类 (category_id: cat-001)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES

-- 文章 1: 故宫深度攻略（付费，精选）
('art-001', 'Forbidden City: Complete Insider Guide 2026', 'forbidden-city-complete-guide',
'A comprehensive 3-day guide to the Forbidden City, covering secret passages, photography spots, and crowd avoidance strategies.',
'## Introduction

The Forbidden City (故宫) is not just a tourist attraction—it is a living museum of 600 years of Chinese imperial history. Most visitors spend 2-3 hours rushing through the main halls, missing 90% of what makes this place truly magical.

This guide will transform your visit from a typical tourist experience into an immersive journey through Chinese history and culture.

## Day 1: The Outer Court

### Best Time to Enter
- **Early Entry (8:30 AM)**: Arrive 15 minutes before opening. The first hour offers the best photography conditions with soft morning light and minimal crowds.
- **Late Afternoon (2:00 PM)**: If you prefer fewer crowds, enter after 2 PM. Most tour groups leave by 3:30 PM, giving you 90 minutes of relatively empty palaces.

### Must-See Halls (Avoiding Crowds)
1. **Hall of Supreme Harmony**: The iconic throne room. Best photographed from the side galleries.
2. **Hall of Central Harmony**: Smaller, less crowded, where emperors prepared for ceremonies.
3. **Hall of Preserving Harmony**: Features the famous "Immortal Carving" stone ramp.

### Secret Photography Spots
- **Corner Towers**: The northeast and northwest corner towers offer stunning reflections in the moat at sunset.
- **Meridian Gate**: The inner balconies provide unique angles of the outer court.
- **Gate of Divine Might**: The northern exit frames the Jinshan Park hill perfectly.

## Day 2: The Inner Court

### The Private Palaces
Unlike the outer court, the inner court housed the emperor''s private life. These smaller palaces reveal intimate details of imperial daily life.

1. **Palace of Heavenly Purity**: The emperor''s residence and office.
2. **Palace of Earthly Tranquility**: The empress''s domain, featuring original Ming Dynasty artifacts.
3. **The Six Eastern Palaces**: Concubine residences, now showcasing imperial daily life exhibits.

### Hidden Gem: The Clock Gallery
Located in the Fengxian Hall, this collection of 18th-century European and Chinese clocks is often missed by rushed visitors. Entry is free but requires a separate ticket at the gate.

## Day 3: The Gardens and Treasures

### Imperial Garden
The northernmost section features ancient trees (some 400+ years old), rockeries, and the Hall of Imperial Peace.

### Treasure Gallery (额外门票 10元)
Located in the eastern palaces, this gallery displays:
- The world-famous Jade Cabbage
- Imperial crowns and jewelry
- Ancient calligraphy and paintings

### Practical Tips

**Crowd Avoidance Strategy**:
- Summer: Visit early morning or late afternoon
- Winter: Any time is good, but dress warmly
- National Holidays: Avoid at all costs

**Photography Tips**:
- Use a wide-angle lens for hall interiors
- Golden Hour (4-6 PM) for exterior shots
- Reflection shots in the moat at sunset

**Hidden Details to Notice**:
- The number of animals on roof ridges (more = higher rank)
- The "Well of No Evil" in the eastern palaces
- The tiny figures in the ceiling paintings

## Tickets and Practical Info

- **Regular Ticket**: ¥60 (Nov-Mar), ¥80 (Apr-Oct)
- **Combined Ticket**: Includes treasure gallery and clock gallery
- **Booking**: Must book online 10 days in advance via WeChat or official website
- **Time Limit**: 8:30-17:00 (ticket valid for morning or afternoon slot)

## Conclusion

The Forbidden City deserves at least one full day, ideally two. This guide covers everything from crowd strategies to hidden details most tourists never see. Your visit will be transformed from a rushed walk-through to an unforgettable cultural experience.

*Last updated: August 2026*',
'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200', 'cat-001', 'user-001', 20, false, true, 'published', 15420, '["forbidden city", "beijing", "imperial palace", "photography", "history"]', DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- 文章 2: 长城徒步路线（付费）
('art-002', 'Great Wall Hiking: From Jinshanling to Simatai', 'great-wall-jinshanling-simatai',
'The ultimate 10km hiking route along the most scenic and unrestored section of the Great Wall.',
'## Why This Route?

The Jinshanling to Simatai West hike is widely considered the most beautiful Great Wall experience. Unlike the crowded Badaling or Mutianyu sections, this 10km route offers:

- **99% fewer tourists** than Badaling
- **Unrestored authenticity** - crumbling watchtowers and wild vegetation
- **Stunning landscapes** - the wall snakes across mountain ridges
- **Sunrise/sunset opportunities** - few places offer better views

## Route Overview

**Distance**: 10km  
**Duration**: 4-5 hours  
**Difficulty**: Moderate (steep stairs, some loose stones)  
**Best Season**: April-May, September-October

## Preparation

### What to Bring
1. **Hiking shoes** with good grip - stones can be slippery
2. **2-3 liters of water** - no vendors on the wall
3. **Sun protection** - hat, sunscreen, sunglasses
4. **Snacks** - energy bars, fruit
5. **Camera** - best Great Wall photography opportunities
6. **Cash** - ¥100-150 for tickets and transport

### Getting There

**From Beijing**:
1. Take subway to Dongzhimen Station (Line 2/13)
2. Walk to Dongzhimen Bus Terminal
3. Take bus 980 to Miyun (1 hour, ¥15)
4. Transfer to local bus to Jinshanling (1.5 hours, ¥10)

**Alternative**: Hire a private driver (¥600-800 round trip, 2.5 hours each way)

## The Hike

### Section 1: Jinshanling Entry (0-2km)
Start at Jinshanling ticket office. The first 2km are partially restored with metal handrails. This section helps you get used to the wall''s uneven surface.

**Highlights**:
- General Tower with unique architectural features
- First panoramic mountain views

### Section 2: The Wild Wall (2-6km)
This is where the magic happens. The wall becomes unrestored, with original Ming Dynasty bricks and vegetation growing through cracks.

**Key Points**:
- **Skyline Tower**: Highest point, 800m elevation
- **East Five-Hole Tower**: Perfect lunch spot with shade
- **Wangquan Tower**: Most photogenic watchtower

**Safety Note**: Some sections have loose bricks. Walk slowly and watch your step. Avoid the wall during rain.

### Section 3: Simatai Approach (6-10km)
The final section becomes steeper as you approach Simatai. The watchtowers here are more intact, showing original construction techniques.

**Highlights**:
- **Fairy Tower**: Unique circular design
- **Sky Bridge**: A narrow catwalk between two cliffs (optional, for adventurous hikers)

## Descent and Return

Exit at Simatai West gate. From here:
1. **Option A**: Walk to Gubei Water Town (15 minutes) for food and rest
2. **Option B**: Take the cable car down (¥40)
3. **Option C**: Hike down the mountain trail (30 minutes)

**Return to Beijing**:
- Last bus from Simatai: 4:00 PM
- Private drivers wait at the parking lot

## Sunrise and Sunset

For photographers, consider these special arrangements:

**Sunrise Hike**:
- Stay overnight at Jinshanling guesthouse (¥200-300)
- Start hiking at 5:00 AM
- Golden hour on the wall: 5:30-6:30 AM

**Sunset Hike**:
- Start at 2:00 PM from Jinshanling
- Reach Simatai by 6:30 PM
- Sunset on the wall: 6:45-7:30 PM (summer)

## Responsible Tourism

- **Leave no trace**: Take all trash with you
- **Respect the wall**: Don''t remove bricks or carve names
- **Stay on path**: Avoid walking on unstable sections
- **Support locals**: Buy from village vendors, not just tourist shops

## Cost Breakdown

- Jinshanling ticket: ¥65
- Simatai ticket: ¥40
- Transport: ¥50-100 (public) or ¥600-800 (private)
- Food and water: ¥50-100
- **Total**: ¥200-250 (budget) or ¥800-1000 (comfort)

## Conclusion

The Jinshanling-Simatai hike is the authentic Great Wall experience that most tourists miss. The combination of stunning scenery, historic authenticity, and relative solitude makes this a once-in-a-lifetime adventure.

*Pro Tip: Combine with a night at Gubei Water Town for the complete experience.*',
'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200', 'cat-001', 'user-001', 25, false, false, 'published', 8920, '["great wall", "hiking", "adventure", "photography", "day trip"]', DATE_SUB(NOW(), INTERVAL 38 DAY), DATE_SUB(NOW(), INTERVAL 38 DAY)),

-- 文章 3: 北京美食指南（免费，引流）
('art-003', 'Beijing Food Guide: 20 Must-Try Local Dishes', 'beijing-food-guide',
'From world-famous Peking Duck to hidden hutong gems, discover the authentic flavors of Beijing.',
'## Introduction

Beijing''s food scene is a delicious blend of imperial court cuisine, traditional northern dishes, and modern culinary innovations. This guide covers 20 essential dishes you must try.

## 1. Peking Duck (北京烤鸭)
**Where to try**:
- **Da Dong** (大董): Modern style, crispy skin
- **Quanjude** (全聚德): Traditional, historic brand
- **Siji Minfu** (四季民福): Local favorite, great value

**Price**: ¥150-300 per duck

## 2. Zhajiangmian (炸酱面)
Noodles with fermented soybean paste. Simple but iconic Beijing comfort food.

**Best spot**: Old Beijing Zhajiangmian (老北京炸酱面大王), ¥25

## 3. Jiaozi (饺子)
Dumplings, a northern staple. Try:
- **Din Tai Fung**: Premium, consistent quality
- **Baoyuan Jiaozi**: Local chain, creative fillings

## 4. Hot Pot (火锅)
Beijing style uses clear broth and emphasizes lamb.

**Recommendation**: Donglaishun (东来顺), the historic Muslim hot pot brand

## 5-20. Other Must-Tries
5. **Mongolian Hot Pot** - lamb-focused
6. **Luzhu (卤煮)** - braised pork offal
7. **Douzhi (豆汁)** - fermented mung bean milk (acquired taste!)
8. **Jiaoquan (焦圈)** - fried dough ring, pair with douzhi
9. **Aiwowo (艾窝窝)** - sweet glutinous rice cake
10. **Ludagun (驴打滚)** - glutinous rice roll with bean flour
11. **Tanghulu (糖葫芦)** - candied hawthorn
12. **Banji (拌鸡)** - cold chicken salad
13. **Huo Shao (火烧)** - baked wheat cake
14. **Yangrou Chuan (羊肉串)** - lamb skewers
15. **Jianbing (煎饼)** - breakfast crepe
16. **Goubuli Baozi** - steamed buns
17. **Tofu Brain (豆腐脑)** - soft tofu with savory sauce
18. **Saozi Noodles (臊子面)** - noodles with pork topping
19. **Buckwheat Noodles (饸饹面)** - healthy alternative
20. **Imperial Court Snacks** - delicate pastries from the palace

## Hutong Food Tours

For the adventurous, join a hutong food tour:
- **Beijing Foodies**: 3-hour walking tour, ¥200
- **Hutong Pizza**: Not Chinese, but a hutong institution

## Practical Tips

- **Meal times**: Lunch 11:30-1:30, Dinner 6:00-8:00
- **Reservations**: Essential for famous duck restaurants
- **Street food**: Safe in tourist areas, be cautious in residential areas
- **Vegetarian options**: Limited but growing

*This free guide covers the basics. For detailed hutong restaurant maps and secret local spots, unlock our premium Beijing Food Deep Dive guide.*',
'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', 'cat-001', 'user-001', 0, true, false, 'published', 22340, '["food", "beijing", "local cuisine", "peking duck", "free guide"]', DATE_SUB(NOW(), INTERVAL 50 DAY), DATE_SUB(NOW(), INTERVAL 50 DAY));

-- 上海分类 (category_id: cat-002)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES

-- 文章 4: 上海外滩夜景攻略（付费）
('art-004', 'Shanghai Bund Night Photography Guide', 'shanghai-bund-night-photography',
'Capture stunning night shots of Shanghai''s iconic skyline with this comprehensive photography guide.',
'## The Perfect Shot

The Bund at night offers one of the world''s most dramatic skylines. This guide covers the best locations, timing, and techniques for capturing Shanghai''s magic.

## Best Photography Spots

### 1. The Bund Promenade (外滩观景平台)
**Best for**: Classic skyline shots
**Time**: Blue hour (30 min after sunset)
**Settings**: f/8-f/11, ISO 100, tripod essential

**Pro Tips**:
- Arrive early to secure a spot (tripod space is limited)
- The light show starts at 7:00 PM sharp
- Capture reflections in the Huangpu River

### 2. The Peace Hotel Rooftop
**Best for**: Unique elevated perspective
**Cost**: ¥100-200 for drinks
**Time**: Sunset to midnight

This historic hotel''s rooftop bar offers unobstructed views without the crowds.

### 3. Pudong Side (陆家嘴)
**Best for**: Looking back at the Bund''s colonial architecture
**Location**: Riverside Promenade
**Bonus**: You can also photograph the three super-tall towers

### 4. Waibaidu Bridge (外白渡桥)
**Best for**: Romantic couple shots
**Famous from**: Numerous Chinese TV dramas and movies

## Technical Guide

### Essential Equipment
- **Camera**: Any DSLR or mirrorless with manual controls
- **Lens**: Wide-angle (16-35mm) for skyline, standard (50mm) for details
- **Tripod**: Mandatory for sharp night shots
- **Remote shutter**: Reduces camera shake

### Camera Settings

**Skyline Shots**:
- Mode: Manual (M)
- Aperture: f/8-f/11 (for sharpness)
- ISO: 100-200 (minimal noise)
- Shutter: 2-10 seconds (experiment)
- White balance: Tungsten (3200K) or custom

**Light Trail Shots**:
- Shutter: 10-30 seconds
- Capture passing boats on the river

**Reflection Shots**:
- Lower tripod to water level
- Use a polarizer to reduce glare

## Timing Guide

### Sunset Schedule (Approximate)
- **Summer**: Sunset 6:30-7:00 PM
- **Winter**: Sunset 5:00-5:30 PM

### Blue Hour (最佳拍摄时间)
Starts 20-30 minutes after sunset. The sky turns deep blue, and city lights create perfect balance.

### Light Show Schedule
The skyline buildings coordinate a light show:
- **Duration**: 10 minutes
- **Start times**: 7:00 PM, 8:00 PM, 9:00 PM (varies by season)
- **Best viewing**: From the Bund promenade

## Itinerary

**4:30 PM**: Arrive, scout locations
**5:00 PM**: Capture golden hour shots
**5:30 PM**: Sunset shots
**6:00 PM**: Blue hour begins (peak photography time)
**7:00 PM**: Light show (capture video)
**7:30 PM**: Move to Peace Hotel for elevated shots
**8:30 PM**: Dinner at a Bund restaurant
**9:30 PM**: Final shots from Pudong side

## Beyond the Skyline

### Architectural Details
Don''t miss the Bund''s colonial buildings:
- **HSBC Building**: Bronze lions at entrance
- **Peace Hotel**: Art deco interior
- **Customs House**: Big Ben-style clock

### Street Photography
The promenade offers excellent candid shots of:
- Couples taking wedding photos
- Tourists from all over China
- Street performers and vendors

## Practical Tips

- **Crowds**: Avoid weekends and Chinese holidays
- **Weather**: Clear nights are best; light clouds can add drama
- **Safety**: Very safe area, but watch your equipment
- **Facilities**: Public restrooms and water fountains available

## Post-Processing

**Recommended workflow**:
1. Shoot in RAW for maximum flexibility
2. Adjust white balance to enhance city lights
3. Increase clarity and vibrance
4. Use graduated filters for sky/foreground balance
5. Export for web at 2000px width

*This premium guide contains detailed maps, camera setting cheat sheets, and exact GPS coordinates for 15 secret photography spots along the Bund.*',
'https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?w=1200', 'cat-002', 'user-001', 18, false, true, 'published', 12150, '["shanghai", "photography", "night view", "the bund", "skyline"]', DATE_SUB(NOW(), INTERVAL 35 DAY), DATE_SUB(NOW(), INTERVAL 35 DAY)),

-- 文章 5: 上海小众咖啡馆（付费）
('art-005', 'Hidden Cafés of Shanghai: 15 Secret Spots', 'shanghai-hidden-cafes',
'Discover Shanghai''s most atmospheric cafés hidden in historic shikumen lanes and art deco buildings.',
'## Beyond the Chains

Shanghai''s café scene goes far beyond Starbucks. This guide reveals 15 hidden gems that even most locals don''t know about.

## Old City Gems

### 1. The Secret Garden Café
**Location**: Inside a 1930s shikumen lane
**Address**: Lane 234, Fuxing Middle Road (hidden door, no sign)
**Specialty**: Single-origin Yunnan coffee
**Vibe**: 1930s Shanghai meets modern minimalism

### 2. Propaganda Poster Art Centre Café
**Location**: Basement of a residential building
**Address**: Huashan Road
**Specialty**: Coffee surrounded by vintage propaganda posters
**Vibe**: Time capsule of 1960s-70s China

## French Concession Favorites

### 3. Café del Volcán
**Why**: One of Shanghai''s first specialty coffee roasters
**Address**: Yongkang Road
**Don''t miss**: Their cold brew, aged in whiskey barrels

### 4. Gregorius
**Vibe**: Dutch coffee culture in Shanghai
**Address**: Lane 56, Xingguo Road
**Signature**: Pour-over single origins

## Artsy Spaces

### 5. Power Station of Art Café
**Location**: Inside the contemporary art museum
**Address**: Huanyang Road
**Bonus**: Great exhibitions, included with museum ticket

### 6. West Bund Museum Café
**View**: Direct riverside location
**Perfect for**: Coffee + art + riverside walk

## Japanese-Inspired

### 7. Glitch Coffee
**Philosophy**: Japanese precision meets Chinese beans
**Address**: Julu Road
**Specialty**: Light roast single origins

### 8. O.P.Café
**Owner**: Japanese barista champion
**Address**: Fumin Road
**Don''t miss**: Their seasonal latte art

## Specialty Roasters

### 9. Seesaw Coffee
**Why**: Pioneered Shanghai''s third-wave coffee
**Multiple locations**: Try the Jing''an Design Center branch
**Insider tip**: Take their barista workshop

### 10. Metal Hands
**Vibe**: Industrial chic
**Signature**: Affogato with local ice cream

## Hidden Courtyards

### 11. The Living Room
**Location**: Inside a restored 1930s mansion
**Address**: Lane 11, Wukang Road
**Perfect for**: Afternoon tea on the terrace

### 12. Daga Coffee
**Concept**: Yunnan-focused, farm-to-cup
**Address**: Anfu Road
**Must try**: Coffee flights from different regions

## Waterfront Views

### 13. The Cannery
**Location**: North Bund
**Specialty**: Coffee by day, cocktails by night
**View**: Unobstructed skyline panorama

### 14. Kakigōri
**Hybrid**: Japanese shaved ice + specialty coffee
**Address**: Julu Road
**Summer essential**: Matcha kakigōri

## Late-Night Coffee

### 15. Cat Ear Coffee
**Hours**: Open until midnight
**Address**: Changle Road
**Vibe**: Cozy, cat-themed, perfect for night owls

## Practical Guide

### Coffee Vocabulary (Chinese)
- 咖啡 (kā fēi) - coffee
- 拿铁 (ná tiě) - latte
- 美式 (měi shì) - Americano
- 手冲 (shǒu chōng) - pour-over
- 冷萃 (lěng cuì) - cold brew

### Average Prices
- Espresso: ¥25-35
- Latte: ¥30-45
- Pour-over: ¥40-60
- Cold brew: ¥35-50

### Best Café-Hopping Routes

**Route 1: French Concession**
Anfu Road → Wukang Road → Huaihai Road
(6 cafés in 2km)

**Route 2: Old City**
Fuxing Road → Xintiandi → Huaihai Road
(Historic + modern mix)

## Café Etiquette

- Most cafés have WiFi: ask for password
- Laptop-friendly hours: usually 10 AM - 4 PM
- Many accept WeChat Pay and Alipay
- Tips not expected, but appreciated

*Premium guide includes detailed maps, owners'' stories, and 10 more secret spots.*',
'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200', 'cat-002', 'user-001', 15, false, false, 'published', 6890, '["coffee", "shanghai", "hidden gems", "french concession", "lifestyle"]', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY));

-- 丝绸之路分类 (category_id: cat-003)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES

-- 文章 6: 敦煌莫高窟深度游（付费，精选）
('art-006', 'Dunhuang Mogao Caves: Complete Visitor Guide', 'dunhuang-mogao-caves-guide',
'Everything you need to know about visiting the world''s most important Buddhist art treasure.',
'## A Thousand Years of Art

The Mogao Caves (莫高窟) represent 1,000 years of Buddhist art, created between the 4th and 14th centuries along the ancient Silk Road. This UNESCO World Heritage site contains 492 cave temples with 45,000 square meters of murals and 2,415 painted statues.

## Why Dunhuang Matters

- **Historical significance**: The world''s largest and richest treasure house of Buddhist art
- **Cultural fusion**: Where Chinese, Indian, Persian, and Greek artistic traditions merged
- **Silk Road legacy**: A crucial stop on ancient trade routes
- **Conservation miracle**: Survived 1,600 years in the desert

## Planning Your Visit

### When to Go
- **Best season**: May-June, September-October
- **Avoid**: Summer heat (40°C+) and winter cold (-10°C)
- **Ideal duration**: 2-3 days

### Tickets
- **Regular ticket**: ¥238 (includes 4 caves + 2 movies + digital center)
- **Special ticket**: ¥300-500 (includes 4 additional special caves)
- **Booking**: Essential! Book 1 month in advance on official website

**Important**: Only 6,000 tickets per day. Book early!

### How to Get There

**Flight**: Beijing/Urumqi → Dunhuang Airport (1-2 hours from city)
**Train**: Lanzhou → Dunhuang (8 hours, overnight train available)
**Bus**: From Jiayuguan (4 hours)

## The Digital Center

Your visit starts here, 15km from the caves:

1. **Orientation Movie** (20 min): Silk Road history
2. **3D Caves Film** (20 min): Virtual tour of closed caves
3. **Shuttle Bus** (15 min): To the cave site

*Pro Tip: The 3D film is spectacular. Sit in the center for the best experience.*

## Cave Types

### Standard Caves (included in ticket)
Your guide will select 4 caves based on:
- Crowd levels
- Conservation status
- Your interests

**Common standard caves**:
- **Cave 96**: Giant Buddha (35.5m tall)
- **Cave 130**: Another giant Buddha (26m)
- **Cave 17**: Library Cave (where the Diamond Sutra was found)

### Special Caves (extra ticket)
These caves have exceptional art but require additional fees:

- **Cave 45**: Tang Dynasty masterpiece
- **Cave 57**: Beautiful bodhisattvas
- **Cave 285**: Western Wei Dynasty, unique style
- **Cave 220**: Stunning murals, previously hidden

**Special cave tip**: Reserve early—only 50 tickets per day for some caves

## What You''ll See

### Wall Paintings
Themes include:
- **Buddhist stories**: Jataka tales and sutra illustrations
- **Daily life**: Tang Dynasty scenes of music, dance, and commerce
- **Donor portraits**: Ancient silk road travelers who funded the caves
- **Decorative patterns**: Lotus flowers, clouds, and geometric designs

### Sculptures
- **Buddha figures**: Seated, standing, and reclining
- **Bodhisattvas**: Graceful, detailed figures
- **Guardian warriors**: Fierce protectors
- **Flying apsaras**: Celestial musicians (Dunhuang''s icon)

## Photography Policy

**Inside caves**: NO photography (conservation requirement)
**Outside**: Photography allowed
**Digital center**: Photography allowed in 3D film

*Note: The no-photos rule protects fragile pigments from light damage. Respect it.*

## Beyond the Caves

### Crescent Lake & Singing Sand Dunes
**Distance**: 5km from Mogao Caves
**Best time**: Sunset for photography
**Activity**: Camel rides, sand sliding, dune climbing
**Tip**: Visit after caves for a perfect day

### Dunhuang Museum
**Free entry**
**Highlights**: Artifacts from the caves, Silk Road exhibits
**Time needed**: 1-2 hours

### Yadan National Geologic Park
**Distance**: 180km from Dunhuang
**Feature**: Otherworldly rock formations
**Best time**: Sunset
**Day trip**: 4-5 hours including travel

## Sample Itinerary

**Day 1**:
- 8:00 AM: Digital Center
- 9:00 AM: Shuttle to caves
- 9:30 AM-12:30 PM: Cave tour (4 caves)
- 1:00 PM: Lunch
- 3:00 PM: Special caves (if booked)
- 5:00 PM: Return to city
- 6:00 PM: Sunset at Crescent Lake

**Day 2**:
- Morning: Dunhuang Museum
- Afternoon: Yadan Geologic Park OR Yangguan Pass

## Practical Tips

### What to Bring
- **Layers**: Desert temperatures swing 20°C between day and night
- **Sun protection**: Hat, sunscreen, sunglasses
- **Water**: 2+ liters per day
- **Power bank**: Your phone will take many photos
- **Cash**: Some vendors don''t accept cards

### Accommodation
- **Luxury**: Dunhuang Hotel (4-star, ¥600-800)
- **Mid-range**: Silk Road Hotel (¥300-500)
- **Budget**: Youth hostels (¥80-150)

### Food
- **Local specialties**: 
  - Camel meat noodles
  - Roasted lamb
  - Li Guang apricots
- **Restaurants**: All near the city center

## Conservation

The caves face ongoing challenges:
- **Climate change**: Increasing humidity affects paintings
- **Tourism impact**: CO₂ from visitors damages art
- **Desert encroachment**: Sand threatens cave exteriors

**How you can help**:
- Follow all photography rules
- Don''t touch walls or statues
- Stay with your group
- Don''t linger in caves (CO₂ buildup)

## Conclusion

Dunhuang is not just a tourist destination—it''s a pilgrimage to one of humanity''s greatest artistic achievements. The caves reveal a world where East met West along the Silk Road, creating something uniquely beautiful.

*This premium guide includes detailed cave-by-cave descriptions, Silk Road history, and photography tips for the desert landscape.*',
'https://images.unsplash.com/photo-1536323760109-ca337eb8a24b?w=1200', 'cat-003', 'user-001', 30, false, true, 'published', 9870, '["dunhuang", "mogao caves", "silk road", "buddhist art", "unesco"]', DATE_SUB(NOW(), INTERVAL 42 DAY), DATE_SUB(NOW(), INTERVAL 42 DAY));

-- 文章 7: 西安古城攻略（付费）
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES
('art-007', 'Xi''an Ancient Capital: Terracotta Warriors and Beyond', 'xian-ancient-capital-guide',
'Discover China''s oldest capital, from the famous Terracotta Army to hidden Tang Dynasty treasures.',
'## The Eternal City

Xi''an (西安) served as China''s capital for 13 dynasties over 3,000 years. While most visitors come for the Terracotta Warriors, the city offers much more.

## Terracotta Warriors (兵马俑)

### Practical Info
- **Distance**: 35km from city center
- **Transport**: Bus 306 from Xi''an Railway Station (1 hour, ¥7)
- **Ticket**: ¥120
- **Time needed**: 3-4 hours

### What You''ll See

**Pit 1** (largest):
- 6,000+ terracotta figures
- Infantry, chariots, and horses
- The iconic "army" view

**Pit 2** (most diverse):
- Cavalry and archers
- Better preserved details
- Fewer crowds

**Pit 3** (command center):
- Smallest, believed to be headquarters
- High-ranking officers

**Museum**:
- Bronze chariots (masterpieces)
- Individual warrior examples
- Weapons and tools

### Photography Tips
- **Best angle**: Elevated viewing platforms in Pit 1
- **Details**: Use telephoto lens for warrior faces
- **Lighting**: Natural light, no flash needed

### Avoiding Crowds
- **Best time**: Arrive at 8:30 AM opening
- **Avoid**: Weekends, Chinese holidays
- **Lunch time**: 11:30-12:30 is less crowded

## Xi''an City Wall (西安城墙)

### The Experience
- **Length**: 13.7km, complete circuit
- **Activity**: Walk (3-4 hours) or cycle (1.5-2 hours)
- **Ticket**: ¥54
- **Bike rental**: ¥45 for 3 hours

### Best Times
- **Sunrise**: City waking up below
- **Sunset**: Golden hour on ancient bricks
- **Night**: Illuminated wall, fewer crowds

### Photo Spots
- **South Gate**: Most impressive entrance
- **Corner towers**: Unique angles
- **Looking down**: Bird''s-eye views of the city

## Muslim Quarter (回民街)

### Street Food Paradise
- **Location**: Behind the Drum Tower
- **Best time**: Evening (5-10 PM)
- **Must-try**:
  1. **Roujiamo** (肉夹馍) - Chinese hamburger
  2. **Yangrou paomo** (羊肉泡馍) - lamb stew with bread
  3. **Biang biang noodles** - wide hand-pulled noodles
  4. **Persimmon cakes** - sweet local dessert

### Tips
- **Cash**: Small bills, most vendors cash-only
- **Crowds**: Go early evening or late night
- **Exploration**: Venture beyond main street for authentic spots

## Big Wild Goose Pagoda (大雁塔)

### Why Visit
- **History**: Tang Dynasty, 1,300+ years old
- **Architecture**: Classic Buddhist pagoda
- **Surroundings**: Da Ci''en Temple and gardens

### Evening Show
- **Music fountain**: Free, starts at 8:30 PM
- **Lighting**: Pagoda beautifully illuminated
- **Crowd factor**: Very popular, arrive early

## Small Wild Goose Pagoda (小雁塔)

### Why It''s Better
- **Fewer tourists**: A hidden gem
- **Museum included**: Xi''an Museum (free)
- **Gardens**: Peaceful traditional Chinese garden
- **Ticket**: Free with ID

## Shaanxi History Museum (陕西历史博物馆)

### The Collection
- **Scope**: 1,700,000 years of history
- **Highlights**: Tang Dynasty gold and silver
- **Must-see**: Murals from ancient tombs

### Practical Info
- **Ticket**: Free (but limited to 5,000/day)
- **Booking**: Reserve online 3 days in advance
- **Time**: 2-3 hours

### Secret Tip
If tickets are "sold out", try the paid exhibition hall (¥30)—it includes access to main halls.

## Hidden Gems

### Great Mosque (大清真寺)
- **Architecture**: Chinese-style mosque, unique in the world
- **Location**: Inside Muslim Quarter
- **Peaceful**: Escape the street food chaos

### Tang Paradise (大唐芙蓉园)
- **Theme**: Tang Dynasty culture park
- **Best**: Night visit with light shows
- **Ticket**: ¥120

### Qianling Mausoleum
- **Distance**: 80km from Xi''an
- **Feature**: Tomb of Empress Wu Zetian (only female emperor)
- **Statues**: 61 headless foreign ambassadors (mystery!)

## Sample Itineraries

### Day 1: City Highlights
- 8:00 AM: City Wall (cycling)
- 11:00 AM: Muslim Quarter lunch
- 2:00 PM: Shaanxi Museum
- 5:00 PM: Small Wild Goose Pagoda
- 8:00 PM: Big Wild Goose Pagoda fountain show

### Day 2: Terracotta + Surroundings
- 8:00 AM: Terracotta Warriors
- 1:00 PM: Lunch in Lintong
- 3:00 PM: Huaqing Palace (hot springs, optional)
- 6:00 PM: Return to city
- 7:30 PM: Muslim Quarter dinner

### Day 3: Day Trip
- Qianling Mausoleum OR
- Huashan Mountain (full day, adventurous)

## Practical Tips

### Getting Around
- **Metro**: Lines 1, 2, 3, 4 cover major sites
- **Bus**: Cheap but confusing for non-Chinese speakers
- **Taxi/Didi**: Affordable, ¥20-50 within city

### Where to Stay
- **Muslim Quarter**: Best for food, budget-mid range
- **City Center**: Convenient, mid-high range
- **Near Big Wild Goose Pagoda**: Scenic, quieter

### Weather
- **Spring/Autumn**: Perfect (15-25°C)
- **Summer**: Hot (35°C+), crowded
- **Winter**: Cold (-5 to 5°C), fewer tourists

## Xi''an Food

### Beyond Street Food
1. **Dumpling Banquet**: De Fa Chang (德发长), near Drum Tower
2. **Tang Dynasty Cuisine**: Luxury restaurants in Tang Paradise
3. **Local favorites**: Ask for 老字号 (time-honored brands)

### Food Streets
- **Muslim Quarter**: Most famous
- **Defu Alley**: Smaller, less touristy
- **Yongxingfang**: Food court with all Xi''an specialties

## Conclusion

Xi''an offers a perfect blend of world-famous sites and authentic local culture. The Terracotta Warriors alone are worth the trip, but the city wall, food scene, and hidden gems make this a 2-3 day destination.

*Premium guide includes detailed maps, Tang Dynasty history deep dive, and off-the-beaten-path locations.*',
'https://images.unsplash.com/photo-1529921879218-f99546d03a9c?w=1200', 'cat-003', 'user-001', 22, false, false, 'published', 7650, '["xian", "terracotta warriors", "ancient capital", "history", "food"]', DATE_SUB(NOW(), INTERVAL 32 DAY), DATE_SUB(NOW(), INTERVAL 32 DAY));

-- 云南分类 (category_id: cat-004)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES

-- 文章 8: 大理丽江慢旅行（付费，精选）
('art-008', 'Dali & Lijiang: Slow Travel Guide', 'dali-lijiang-slow-travel',
'Two weeks in Yunnan''s most beautiful towns: ancient towns, ethnic cultures, and mountain adventures.',
'## The Slow Approach

Yunnan (云南) rewards slow travel. This two-week itinerary explores Dali and Lijiang at a relaxed pace, allowing you to discover hidden corners and connect with local Bai and Naxi cultures.

## Dali (大理) - Days 1-7

### Why Dali?
- **Vibe**: Relaxed, creative community
- **Culture**: Bai ethnic minority
- **Nature**: Erhai Lake, Cangshan Mountains
- **Weather**: Spring-like year-round

### Old Town (大理古城)

**Where to stay**: Renmin Road area (restaurants, cafés)
**Where to avoid**: The main tourist strip near the south gate

**Must-do**:
1. **Morning market** (6-9 AM): Authentic local life
2. **Foreigner Street**: Former hippie hangout, now gentrified but still interesting
3. **City walls**: Free views of the old town

### Erhai Lake (洱海)

**Transport options**:
1. **Electric scooter** (recommended): ¥60/day, circumnavigate the lake
2. **Bike**: ¥30/day, slower but more exercise
3. **Car hire**: ¥500/day with driver

**Stops along the lake**:
- **Xizhou (喜洲)**: Bai architecture, try Xizhou baba (local bread)
- **Shuanglang (双廊)**: Trendy, restaurants with lake views
- **Xiaoputuo Island**: Small temple on an island
- **Haishe Park**: Wetlands, perfect for sunrise

### Cangshan Mountains (苍山)

**Options**:
1. **Cable car**: Three routes, ¥280 for all
2. **Hiking**: 18km Jade Belt Road at 2,600m
3. **All-day trek**: Summit at 4,000m (hire a guide)

**Best view**: From the cable car, looking down at Erhai Lake

### Dali Food

**Must-try**:
1. **Dali hot fish** (大理酸辣鱼): Local specialty
2. **Rushan** (乳扇): Cheese on a stick
3. **Xizhou baba** (喜洲粑粑): Sweet or savory flatbread
4. **Wild mushrooms**: Summer season only

## Three Pagodas (崇圣寺三塔)

- **History**: 1,000+ years old
- **Photo tip**: Reflection in the lake behind
- **Time needed**: 2-3 hours
- **Ticket**: ¥75

## Lijiang (丽江) - Days 8-14

### Why Lijiang?
- **UNESCO site**: Best-preserved ancient town in China
- **Culture**: Naxi ethnic minority, matriarchal traditions
- **Nature**: Jade Dragon Snow Mountain nearby
- **Warning**: Very touristy, but still magical

### Old Town (丽江古城)

**Where to stay**: Shuhe (束河) - quieter alternative to main Lijiang old town

**Must-see**:
1. **Sifang Street**: The central square, bustling with activity
2. **Black Dragon Pool**: Classic photo spot with mountain backdrop
3. **Water wheels**: Iconic Lijiang symbol
4. **Naxi buildings**: Look for traditional wood carvings

**Hidden corners**:
- **Wenhai Village**: 30-minute drive, authentic Naxi life
- **Baisha Village**: Older than Lijiang, fewer tourists
- **Tiger Leaping Gorge**: 2-day hike (covered in separate guide)

### Jade Dragon Snow Mountain (玉龙雪山)

**Getting there**: Bus from Lijiang, 45 minutes

**The mountain**:
- **Height**: 5,596m (don''t worry, cable car goes to 4,506m)
- **Ticket**: ¥100 + cable car ¥120-200

**Route options**:
1. **Glacier Park**: Highest accessible point, cable car to 4,506m
2. **Spruce Meadow**: Lower elevation, easier walking
3. **Yak Meadow**: Least crowded, authentic Tibetan feel

**Important**: Book cable car tickets early—limited daily quota

**Altitude sickness**: Real risk at 4,500m. Walk slowly, bring oxygen if needed.

### Blue Moon Valley (蓝月谷)

- **Location**: At base of Snow Mountain
- **Color**: Turquoise water (mineral deposits)
- **Photo**: Iconic mountain + lake shot
- **Included**: With Snow Mountain ticket

### Lijiang Food

**Naxi specialties**:
1. **Naxi hot pot**: Yak meat, local vegetables
2. **Naxi sandwich**: Bread with local fillings
3. **Chickpea tofu**: Unique to the region
4. **Wild mushroom hot pot**: Summer delicacy

**Restaurant tip**: Avoid restaurants with "English menu" touts. Look for places full of locals.

### Naxi Culture

**Dongba script**: The world''s only living pictographic writing system

**Where to see it**:
- **Dongba Museum**: Learn about the script
- **Dongba Palace**: Traditional music performances (avoid the expensive tourist shows)

**Music**: Naxi ancient orchestra, 700-year-old traditions
- **Authentic performance**: At the Naxi Concert Hall, nightly

## Sample Itinerary

**Week 1: Dali**
- Days 1-2: Old town, morning markets
- Day 3: Erhai Lake circle (scooter)
- Day 4: Xizhou + Shuanglang
- Day 5: Cangshan Mountains hiking
- Day 6: Three Pagodas + relaxation
- Day 7: Travel to Lijiang (bus 2.5 hours, ¥80)

**Week 2: Lijiang**
- Days 8-9: Lijiang old town exploration
- Day 10: Baisha + Jade Dragon Snow Mountain
- Day 11: Blue Moon Valley + relaxation
- Day 12: Tiger Leaping Gorge day trip (or 2-day hike)
- Day 13: Shuhe village + cooking class
- Day 14: Departure

## Practical Tips

### Weather
- **Dali**: 15-25°C year-round, rainy June-September
- **Lijiang**: Similar, but colder at Snow Mountain
- **Best time**: March-May, October-November

### Altitude
- **Dali**: 2,000m (no issues)
- **Lijiang**: 2,400m (mild altitude)
- **Snow Mountain**: 4,500m (real risk)

### Getting Between Cities
- **Bus**: 2.5 hours, ¥80, every 30 minutes
- **Private car**: ¥300-400, 2 hours

### Packing
- **Layers**: Mountain weather changes quickly
- **Rain gear**: Essential in summer
- **Sun protection**: High altitude UV
- **Comfortable shoes**: Cobblestone streets

## Budget

### Daily Costs
- **Budget**: ¥200-300 (hostel, street food, walking)
- **Mid-range**: ¥500-800 (hotel, restaurants, activities)
- **Comfort**: ¥1,000+ (boutique hotels, private tours)

### Two-Week Budget
- **Budget traveler**: ¥3,000-4,000
- **Mid-range**: ¥7,000-12,000
- **Comfort**: ¥15,000+

## Responsible Tourism

- **Water bottles**: Bring a filter or refill at stations
- **Plastic**: Dali and Lijiang are plastic-free zones
- **Cultural respect**: Ask before photographing people
- **Local businesses**: Choose local guides and shops over chains

## Conclusion

Dali and Lijiang reward those who slow down. The beauty lies not in ticking off sights, but in wandering ancient streets, sharing tea with locals, and watching the sunset over the mountains.

*This premium guide includes detailed maps, homestay recommendations, and a complete Naxi cultural immersion itinerary.*',
'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200', 'cat-004', 'user-001', 28, false, true, 'published', 8340, '["dali", "lijiang", "yunnan", "slow travel", "ethnic culture"]', DATE_SUB(NOW(), INTERVAL 40 DAY), DATE_SUB(NOW(), INTERVAL 40 DAY)),

-- 文章 9: 香格里拉秘境（付费）
('art-009', 'Shangri-La: Tibet Without Permits', 'shangri-la-tibet-without-permits',
'Experience Tibetan culture in Shangri-La, no special permits required.',
'## The Real Shangri-La

Shangri-La (香格里拉) offers the closest experience to Tibet without the complex permit requirements. At 3,200m elevation, this former trading town on the Tea Horse Road provides authentic Tibetan culture, stunning monasteries, and pristine nature.

## Why Shangri-La?

- **No Tibet permit**: Open to all travelers
- **Tibetan culture**: 80% of population is Tibetan
- **Nature**: Pristine mountains, lakes, and meadows
- **History**: Ancient Tea Horse Road stop
- **Spiritual**: Songzanlin Monastery, "Little Potala Palace"

## Getting There

### From Lijiang
- **Bus**: 4 hours, ¥68
- **Private car**: 3.5 hours, ¥400-600
- **Scenery**: Stunning mountain views en route

### From Kunming
- **Flight**: 1 hour, ¥400-800
- **Bus**: 12 hours (not recommended)

## Old Town (独克宗古城)

### What Happened
A 2014 fire destroyed much of the old town, but it has been rebuilt with traditional methods.

### Highlights
1. **Giant Prayer Wheel**: World''s largest, requires 10 people to turn
2. **Tibetan architecture**: Rebuilt with traditional techniques
3. **Square Street**: Evening dancing, join the locals
4. **Viewpoint**: Climb to the temple at the top

### Authentic Experience
Avoid the main tourist streets. Explore the quieter lanes where locals live and work.

## Songzanlin Monastery (松赞林寺)

### The Basics
- **Founded**: 1679
- **Style**: Modeled on Lhasa''s Potala Palace
- **Significance**: Largest Tibetan Buddhist monastery in Yunnan
- **Monks**: 700+ resident monks

### Visiting
- **Ticket**: ¥90
- **Time needed**: 2-3 hours
- **Transport**: Bus #3 from old town

### What You''ll See
1. **Main assembly hall**: Magnificent golden roof
2. **Living quarters**: Monks'' simple rooms
3. **Stupas**: Golden reliquary structures
4. **Views**: Monastery overlooking the valley

### Photography
- **Best angle**: From the parking lot, looking up
- **Interior**: Allowed (no flash)
- **Monks**: Ask permission before photographing

### Respectful Behavior
- Walk clockwise around stupas
- Remove shoes in temples
- Don''t point your feet at Buddha images
- Silence your phone

## Pudacuo National Park (普达措国家公园)

### Overview
- **Size**: 1,300 sq km
- **Elevation**: 3,500-4,000m
- **Ticket**: ¥138 + bus ¥60

### Highlights
1. **Shudu Lake**: Alpine lake with wooden boardwalk
2. **Bita Lake**: Higher elevation, more pristine
3. **Meadows**: Yaks grazing, wildflowers in summer
4. **Forest**: Old-growth spruce and fir

### Practical Tips
- **Altitude**: 3,500m+, walk slowly
- **Weather**: Changes quickly, bring layers
- **Time needed**: 4-5 hours
- **Crowds**: Go early (8 AM opening)

## Napa Lake (纳帕海)

### Seasonal Beauty
- **Summer**: Wetland, birds, reflections
- **Winter**: Dried grassland, horses, yaks

### Activities
- **Horse riding**: ¥100/hour
- **Cycling**: Rent bikes in town, 20km loop
- **Photography**: Golden hour is magical

## Tibetan Culture

### Homestay Experience
Stay with a Tibetan family:
- **Location**: Outskirts of town
- **Cost**: ¥200-300/night with meals
- **Includes**: Butter tea, yak butter, stories

### Food
1. **Yak butter tea**: Acquired taste, try it
2. **Tsampa**: Roasted barley flour, Tibetan staple
3. **Yak meat**: Fresh and dried
4. **Tibetan bread**: Thick, slightly sweet
5. **Chang**: Tibetan barley beer

### Festivals
- **Horse Racing Festival**: June (exact date varies)
- **Tibetan New Year**: February (date varies by Tibetan calendar)

## Day Trips

### Benzilan (奔子栏)
- **Distance**: 80km
- **Feature**: Traditional Tibetan village, less touristy
- **Activity**: Pottery workshop, thangka painting

### Meili Snow Mountain (梅里雪山)
- **Distance**: 200km
- **Pilgrimage**: One of the holiest mountains in Tibetan Buddhism
- **Best time**: October-November for clear views
- **Sunrise**: View from Feilaisi Temple

**Note**: This is a long day trip (6 hours each way) or better as an overnight.

## Sample Itinerary

**Day 1**: Old town, giant prayer wheel
**Day 2**: Songzanlin Monastery, afternoon rest (altitude)
**Day 3**: Pudacuo National Park
**Day 4**: Napa Lake + cultural activities
**Day 5**: Day trip to Benzilan or Meili Snow Mountain

## Practical Tips

### Altitude Sickness
- **Elevation**: 3,200m (town), 4,000m (Pudacuo)
- **Symptoms**: Headache, nausea, shortness of breath
- **Prevention**: Walk slowly, stay hydrated, avoid alcohol
- **Remedies**: Oxygen available at pharmacies, rest

### Weather
- **Summer**: 10-25°C, rain possible
- **Winter**: -10 to 10°C, clear skies
- **Best time**: May-June, September-November

### Packing
- **Layers**: Temperature swings 20°C between day and night
- **Sun protection**: High altitude UV
- **Rain gear**: Summer essential
- **Comfortable shoes**: Cobblestones and hiking

### Accommodation
- **Budget**: Hostels, ¥80-150
- **Mid-range**: Boutique hotels, ¥300-600
- **Luxury**: Songtsam lodges, ¥1,500-3,000

## Responsible Tourism

- **Cultural respect**: Tibetan Buddhism is deeply sacred
- **Photography**: Always ask permission
- **Environment**: Pudacuo is fragile, stay on paths
- **Local economy**: Buy from Tibetan artisans

## Budget

### Daily Costs
- **Budget**: ¥250-400
- **Mid-range**: ¥600-1,000
- **Comfort**: ¥1,500+

## Conclusion

Shangri-La offers a gateway to Tibetan culture that''s accessible to all. The combination of spiritual sites, pristine nature, and warm Tibetan hospitality makes this a destination that stays with you long after you leave.

*Premium guide includes detailed monastery tour, meditation retreat options, and off-the-beaten-path villages.*',
'https://images.unsplash.com/photo-1527684658956-678ba98379f3?w=1200', 'cat-004', 'user-001', 25, false, false, 'published', 6780, '["shangri-la", "tibetan culture", "monastery", "yunnan", "spiritual"]', DATE_SUB(NOW(), INTERVAL 36 DAY), DATE_SUB(NOW(), INTERVAL 36 DAY));

-- 成都分类 (category_id: cat-005)
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES

-- 文章 10: 成都美食+熊猫（付费）
('art-010', 'Chengdu: Pandas and Hot Pot Paradise', 'chengdu-pandas-hotpot',
'The ultimate guide to China''s most relaxed city: world-famous pandas, fiery hot pot, and laid-back teahouse culture.',
'## Why Chengdu?

Chengdu (成都) is famous for three things: pandas, hot pot, and a relaxed lifestyle. Locals say the city''s motto is "Don''t worry, be happy"—and you''ll feel it.

## Giant Pandas (大熊猫)

### Chengdu Research Base
- **Distance**: 10km north of city
- **Transport**: Metro Line 3 to Panda Base Station + shuttle
- **Ticket**: ¥55
- **Time needed**: 3-4 hours

### Best Time to Visit
- **Early morning**: 8-10 AM, pandas are most active (feeding time)
- **Avoid**: Afternoon, pandas sleep in heat

### What You''ll See
1. **Adult pandas**: Eating, sleeping, climbing
2. **Red pandas**: Smaller, more active cousins
3. **Baby pandas**: (August-October) in nursery
4. **Museum**: Panda biology and conservation

### Photography Tips
- **Adults**: Patient, they move slowly
- **Red pandas**: Faster, harder to photograph
- **Best shots**: Morning feeding, bamboo eating

### Beyond the Base
- **Dujiangyan Panda Valley**: Fewer crowds, volunteer program
- **Wolong Nature Reserve**: Wild pandas (permits required)

## Hot Pot (火锅)

### The Chengdu Style
- **Broth**: Numbing (ma 麻) and spicy (la 辣)
- **Base**: Beef tallow with Sichuan peppercorns
- **Dip**: Sesame oil + garlic + vinegar

### Where to Eat

**Budget**:
- **Huo Guo Zhuang**: ¥80-100 per person
- **Street hot pot**: ¥50-70, authentic local vibe

**Mid-range**:
- **Xiaolongkan**: Popular chain, ¥100-150
- **Shudaxia**: Themed, ¥120-180

**Premium**:
- **Yankee Candle Hot Pot**: Upscale, ¥200-300

### What to Order
1. **Beef slices**: Thin, cook 10 seconds
2. **Duck intestine**: Crunchy, cook 1 minute
3. **Tripe**: Classic hot pot item
4. **Tofu skin**: Quick-cooking
5. **Lotus root**: Adds sweetness
6. **Vegetables**: Balance the heat

### Pro Tips
- **Non-spicy option**: Yuanyang pot (half spicy, half clear)
- **Drink**: Soy milk or plum juice to cool the heat
- **Clothing**: Wear something you don''t mind smelling like hot pot

## Teahouse Culture

### People''s Park (人民公园)
- **Vibe**: Locals playing mahjong, sipping tea
- **Price**: ¥20-30 for tea, sit all day
- **Activity**: Ear cleaning (traditional service, ¥30)

### Other Teahouses
- **Wenshu Monastery**: Buddhist temple, peaceful
- **Wangping Teahouse**: Historic, by the river
- **Lao Teahouse**: Traditional, no English menu

### Tea Ceremony
- **Price**: ¥50-100
- **Learn**: How to brew proper Sichuan tea
- **Types**: Jasmine, Bamboo Leaf Green, Maofeng

## Sichuan Opera (川剧)

### Face-Changing Show
- **Where**: Most teahouses offer evening shows
- **Time**: 7:30-9:00 PM
- **Price**: ¥80-150 (includes tea)

### What You''ll See
1. **Face changing**: Magical, instant mask changes
2. **Fire breathing**: Dramatic finale
3. **Traditional music**: Lively, authentic

**Tip**: Book through your hotel for discounts.

## Old Streets

### Kuanzhai Alleys (宽窄巷子)
- **Vibe**: Touristy but charming
- **Shops**: Souvenirs, snacks, cafés
- **Avoid**: Weekend crowds

### Jinli Ancient Street
- **Night visit**: Beautiful lanterns
- **Food**: Street snacks, try everything
- **Crafts**: Local artisans

### Authentic Alternative
- **Yulin Road**: Real local life, fewer tourists

## Leshan Giant Buddha (乐山大佛)

### Day Trip
- **Distance**: 150km, 2 hours by bus
- **Ticket**: ¥80
- **Time needed**: 4-5 hours

### What You''ll See
- **Height**: 71 meters, world''s largest stone Buddha
- **Age**: 1,300 years old
- **Scale**: Fingernails are larger than a person

### View Options
1. **Hike down**: 250+ steps, close-up views
2. **Boat**: View from the river, best full-body shot

### Tip: Combine with Emei Mountain for a 2-day trip.

## Sample Itinerary

**Day 1**:
- 8:00 AM: Panda Base
- 1:00 PM: Lunch (hot pot)
- 3:00 PM: People''s Park teahouse
- 7:30 PM: Sichuan Opera

**Day 2**:
- 9:00 AM: Kuanzhai Alleys
- 12:00 PM: Street food lunch
- 2:00 PM: Wenshu Monastery
- 6:00 PM: Jinli Street (night)

**Day 3**: Leshan Buddha day trip

## Food Guide

### Beyond Hot Pot
1. **Mapo tofu** (麻婆豆腐): Spicy, numbing
2. **Kung pao chicken** (宫保鸡丁): Classic Sichuan
3. **Twice-cooked pork** (回锅肉): Flavorful
4. **Fish in chili oil** (水煮鱼): Numbing
5. **Dan dan noodles** (担担面): Street food classic

### Street Snacks
- **Rabbit heads**: Local specialty (not for everyone)
- **Skewers**: Cumin-spiced lamb
- **Douhua**: Soft tofu, sweet or savory
- **Zhong dumplings**: Chengdu style

### Food Tours
- **Chengdu Food Tours**: 3-hour walking, ¥200
- **Cooking class**: Learn to make mapo tofu, ¥300

## Practical Tips

### Weather
- **Summer**: Hot and humid (30°C+)
- **Winter**: Mild (5-15°C)
- **Best time**: March-June, September-November

### Getting Around
- **Metro**: Excellent, covers all major sites
- **Didi**: Affordable, ¥15-30 within city
- **Bike share**: Easy for short trips

### Accommodation
- **Near Chunxi Road**: Shopping, food, metro
- **Kuanzhai Alleys**: Touristy but convenient
- **Yulin Road**: Authentic local vibe

## Budget

### Daily Costs
- **Budget**: ¥200-300 (hostel, street food)
- **Mid-range**: ¥500-800 (hotel, restaurants)
- **Comfort**: ¥1,000+ (boutique, premium food)

## Conclusion

Chengdu rewards those who slow down. Spend a morning with pandas, an afternoon in a teahouse, and an evening over hot pot. This is the essence of the city: relaxed, delicious, and utterly charming.

*Premium guide includes detailed panda photography tips, off-the-beaten-path eateries, and a complete Sichuan cooking class itinerary.*',
'https://images.unsplash.com/photo-1567359781514-3b0509c43a6e?w=1200', 'cat-005', 'user-001', 20, false, false, 'published', 9450, '["chengdu", "pandas", "hot pot", "food", "teahouse"]', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_SUB(NOW(), INTERVAL 30 DAY));

-- 添加更多文章（简化版，节省篇幅）
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES
('art-011', 'Jiuzhaigou: China''s Most Beautiful Valley', 'jiuzhaigou-valley-guide',
'Explore the fairy-tale lakes and waterfalls of Jiuzhaigou, a UNESCO World Heritage site.',
'## The Fairyland

Jiuzhaigou (九寨沟) is often called the most beautiful place in China. The valley''s turquoise lakes, multi-tiered waterfalls, and colorful forests create a scene straight from a painting.

## Practical Info
- **Location**: Northern Sichuan, 450km from Chengdu
- **Ticket**: ¥169 + bus ¥90
- **Best time**: October (autumn colors)
- **Duration**: 2 days recommended

## The Lakes
1. **Five Flower Lake**: Most colorful, iconic Jiuzhaigou shot
2. **Mirror Lake**: Perfect reflections on calm days
3. **Long Lake**: Highest lake in the valley
4. **Panda Lake**: Named for pandas that once lived here

## Tips
- Stay 2 days: One day is too rushed
- Y-shaped valley: Start early, take bus to end, walk back
- Photography: Morning light is best
- Crowds: Go in shoulder season (May, September)

*Premium guide includes detailed hiking routes, photography spots, and accommodation recommendations.*',
'https://images.unsplash.com/photo-1513415756790-2ac1db1297d0?w=1200', 'cat-005', 'user-001', 22, false, false, 'published', 5230, '["jiuzhaigou", "nature", "unesc", "lakes", "hiking"]', DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_SUB(NOW(), INTERVAL 25 DAY));

-- 剩余文章（简化内容）
INSERT INTO articles (id, title, slug, excerpt, content, cover_image_url, category_id, author_id, point_cost, is_free, is_featured, status, view_count, tags, created_at, published_at) VALUES
-- 文章 12-20（其他分类）
('art-012', 'Huangshan Mountain: Sea of Clouds', 'huangshan-mountain-guide', 'China''s most famous mountain, known for granite peaks, twisted pines, and cloud seas.', '## The Essence of Chinese Landscape\n\nHuangshan (黄山) has inspired Chinese poets and painters for centuries. This guide covers everything from sunrise spots to mountain hotels.\n\n**Highlights**:\n- Sunrise at Lion Peak\n- Sea of clouds (winter)\n- Hot springs at the base\n\n*Premium guide covers 3-day itinerary and photography tips.*', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', 'cat-006', 'user-001', 18, false, false, 'published', 4560, '["huangshan", "mountain", "sunrise", "photography"]', DATE_SUB(NOW(), INTERVAL 22 DAY), DATE_SUB(NOW(), INTERVAL 22 DAY)),

('art-013', 'Zhangjiajie: Avatar Mountains', 'zhangjiajie-avatar-mountains', 'The real-world inspiration for Avatar''s floating mountains.', '## Avatar Come to Life\n\nZhangjiajie (张家界)''s towering sandstone pillars inspired James Cameron''s Avatar. This is China''s most otherworldly landscape.\n\n**Must-see**:\n- Avatar Hallelujah Mountain\n- Tianzi Mountain\n- Glass bridge (world''s longest)\n\n*Premium guide includes 3-day hiking routes.*', 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=1200', 'cat-006', 'user-001', 20, false, false, 'published', 5120, '["zhangjiajie", "avatar", "mountains", "nature"]', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY)),

('art-014', 'Guilin & Yangshuo: Karst Landscapes', 'guilin-yangshuo-karst', 'Cruise the Li River through China''s most iconic karst scenery.', '## The Classic View\n\nThe 20 Yuan note features Guilin (桂林) scenery. This guide covers river cruises, cycling routes, and rock climbing.\n\n**Highlights**:\n- Li River cruise\n- Yangshuo cycling\n- Moon Hill climbing\n\n*Premium guide includes off-season tips and hidden villages.*', 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1200', 'cat-006', 'user-001', 15, false, false, 'published', 6780, '["guilin", "yangshuo", "karst", "river cruise"]', DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY)),

('art-015', 'Harbin Ice Festival: Winter Wonderland', 'harbin-ice-festival', 'The world''s largest ice and snow festival, running January-February annually.', '## Ice City\n\nHarbin (哈尔滨) transforms into a frozen fantasyland every winter. Ice buildings, snow sculptures, and sub-zero temperatures.\n\n**What to expect**:\n- Ice and Snow World (ice buildings)\n- Sun Island (snow sculptures)\n- Siberian Tiger Park\n\n*Premium guide covers winter survival tips.*', 'https://images.unsplash.com/photo-1517164850305-99a3e65bb47e?w=1200', 'cat-006', 'user-001', 12, false, false, 'published', 3890, '["harbin", "ice festival", "winter", "snow"]', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),

('art-016', 'Suzhou: Venice of the East', 'suzhou-gardens-water-towns', 'Classical gardens and ancient water towns near Shanghai.', '## Garden City\n\nSuzhou (苏州) is famous for classical Chinese gardens, silk, and canal-lined streets. Perfect day trip from Shanghai.\n\n**Must-see**:\n- Humble Administrator''s Garden\n- Tiger Hill\n- Water towns (Zhouzhuang, Tongli)\n\n*Premium guide includes garden photography tips.*', 'https://images.unsplash.com/photo-1545893835-abaa50cbe628?w=1200', 'cat-002', 'user-001', 12, false, false, 'published', 4320, '["suzhou", "gardens", "water town", "day trip"]', DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY)),

('art-017', 'Hangzhou: West Lake Paradise', 'hangzhou-west-lake', 'Marco Polo called it the finest city on earth. Discover West Lake''s timeless beauty.', '## Heaven on Earth\n\nHangzhou (杭州) has enchanted visitors for millennia. West Lake, tea plantations, and temples create a serene escape.\n\n**Highlights**:\n- West Lake boat ride\n- Lingyin Temple\n- Dragon Well tea villages\n\n*Premium guide covers 2-day leisure itinerary.*', 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=1200', 'cat-002', 'user-001', 15, false, false, 'published', 5670, '["hangzhou", "west lake", "tea", "temples"]', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY)),

('art-018', 'Kashgar: Silk Road Living Museum', 'kashgar-silk-road', 'Central Asia meets China in this ancient Silk Road trading post.', '## The Silk Road Lives\n\nKashgar (喀什) is the best-preserved Silk Road city in China. Uyghur culture, bazaars, and ancient architecture.\n\n**Must-see**:\n- Sunday Market (largest in Central Asia)\n- Old town exploration\n- Id Kah Mosque\n\n*Premium guide includes cultural etiquette and permit info.*', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200', 'cat-003', 'user-001', 28, false, false, 'published', 3450, '["kashgar", "silk road", "uyghur", "bazaar"]', DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY)),

('art-019', 'Xiamen: Island Garden City', 'xiamen-gulangyu-island', 'A relaxed coastal city with colonial architecture and car-free Gulangyu Island.', '## Seaside Charm\n\nXiamen (厦门) offers a gentler pace: colonial buildings, beach walks, and the car-free Gulangyu Island.\n\n**Highlights**:\n- Gulangyu Island (UNESCO)\n- Nanputuo Temple\n- Beach promenade\n\n*Premium guide covers 3-day leisure itinerary.*', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', 'cat-006', 'user-001', 10, false, false, 'published', 2980, '["xiamen", "gulangyu", "coastal", "colonial"]', DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY)),

('art-020', 'Qingdao: Beer and Beaches', 'qingdao-beer-beaches', 'German heritage meets Chinese seaside in this coastal city.', '## Beer City\n\nQingdao (青岛) is famous for Tsingtao Beer, German architecture, and beaches. Perfect summer destination.\n\n**Highlights**:\n- Beer Museum (with tastings)\n- Badaguan (German quarter)\n- Laoshan Mountain\n\n*Premium guide includes beer festival timing.*', 'https://images.unsplash.com/photo-1555881400-74d7acb3389c?w=1200', 'cat-006', 'user-001', 10, false, false, 'published', 3120, '["qingdao", "beer", "beaches", "german heritage"]', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ============================================================
-- 3. 测试订单（15 个，覆盖各种状态）
-- ============================================================

INSERT INTO orders (id, order_number, user_id, package_id, amount_usd, points_awarded, status, provider, paid_at, refunded_at, created_at) VALUES
-- 已完成订单（10 个）
('ord-001', 'CPT-20260801001', 'user-001', 'pkg-002', 15.00, 510, 'completed', 'stripe', DATE_SUB(NOW(), INTERVAL 28 DAY), NULL, DATE_SUB(NOW(), INTERVAL 28 DAY)),
('ord-002', 'CPT-20260801002', 'user-002', 'pkg-001', 5.00, 150, 'completed', 'paypal', DATE_SUB(NOW(), INTERVAL 25 DAY), NULL, DATE_SUB(NOW(), INTERVAL 25 DAY)),
('ord-003', 'CPT-20260801003', 'user-004', 'pkg-004', 60.00, 2280, 'completed', 'stripe', DATE_SUB(NOW(), INTERVAL 22 DAY), NULL, DATE_SUB(NOW(), INTERVAL 22 DAY)),
('ord-004', 'CPT-20260801004', 'user-006', 'pkg-002', 15.00, 510, 'completed', 'mock', DATE_SUB(NOW(), INTERVAL 20 DAY), NULL, DATE_SUB(NOW(), INTERVAL 20 DAY)),
('ord-005', 'CPT-20260801005', 'user-001', 'pkg-003', 30.00, 1080, 'completed', 'stripe', DATE_SUB(NOW(), INTERVAL 18 DAY), NULL, DATE_SUB(NOW(), INTERVAL 18 DAY)),
('ord-006', 'CPT-20260801006', 'user-008', 'pkg-001', 5.00, 150, 'completed', 'paypal', DATE_SUB(NOW(), INTERVAL 15 DAY), NULL, DATE_SUB(NOW(), INTERVAL 15 DAY)),
('ord-007', 'CPT-20260801007', 'user-009', 'pkg-002', 15.00, 510, 'completed', 'stripe', DATE_SUB(NOW(), INTERVAL 12 DAY), NULL, DATE_SUB(NOW(), INTERVAL 12 DAY)),
('ord-008', 'CPT-20260801008', 'user-010', 'pkg-003', 30.00, 1080, 'completed', 'mock', DATE_SUB(NOW(), INTERVAL 10 DAY), NULL, DATE_SUB(NOW(), INTERVAL 10 DAY)),
('ord-009', 'CPT-20260801009', 'user-004', 'pkg-001', 5.00, 150, 'completed', 'paypal', DATE_SUB(NOW(), INTERVAL 8 DAY), NULL, DATE_SUB(NOW(), INTERVAL 8 DAY)),
('ord-010', 'CPT-20260801010', 'user-002', 'pkg-002', 15.00, 510, 'completed', 'stripe', DATE_SUB(NOW(), INTERVAL 5 DAY), NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- 待支付订单（2 个）
('ord-011', 'CPT-20260801011', 'user-003', 'pkg-002', 15.00, 510, 'pending', 'stripe', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),
('ord-012', 'CPT-20260801012', 'user-005', 'pkg-001', 5.00, 150, 'pending', 'paypal', NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 已退款订单（2 个）
('ord-013', 'CPT-20260801013', 'user-007', 'pkg-001', 5.00, 150, 'refunded', 'stripe', DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 21 DAY)),
('ord-014', 'CPT-20260801014', 'user-008', 'pkg-002', 15.00, 510, 'refunded', 'paypal', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 16 DAY)),

-- 失败订单（1 个）
('ord-015', 'CPT-20260801015', 'user-005', 'pkg-003', 30.00, 1080, 'failed', 'stripe', NULL, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY));

-- ============================================================
-- 4. 积分交易记录（部分示例）
-- ============================================================

INSERT INTO point_transactions (user_id, points_delta, balance_after, type, reference_id, admin_note, created_at) VALUES
-- 用户 001 的积分历史
('user-001', 510, 510, 'purchase', 'ord-001', 'Explorer Package', DATE_SUB(NOW(), INTERVAL 28 DAY)),
('user-001', -20, 490, 'unlock', 'art-001', 'Forbidden City Guide', DATE_SUB(NOW(), INTERVAL 26 DAY)),
('user-001', -25, 465, 'unlock', 'art-002', 'Great Wall Hiking', DATE_SUB(NOW(), INTERVAL 24 DAY)),
('user-001', 1080, 1545, 'purchase', 'ord-005', 'Adventurer Package', DATE_SUB(NOW(), INTERVAL 18 DAY)),
('user-001', -30, 1515, 'unlock', 'art-006', 'Dunhuang Mogao Caves', DATE_SUB(NOW(), INTERVAL 16 DAY)),
('user-001', -28, 1487, 'unlock', 'art-008', 'Dali Lijiang Guide', DATE_SUB(NOW(), INTERVAL 14 DAY)),
('user-001', -18, 1469, 'unlock', 'art-004', 'Shanghai Bund Night', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('user-001', -22, 1447, 'unlock', 'art-007', 'Xian Ancient Capital', DATE_SUB(NOW(), INTERVAL 7 DAY)),
('user-001', -15, 1432, 'unlock', 'art-005', 'Shanghai Hidden Cafes', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('user-001', -20, 1412, 'unlock', 'art-010', 'Chengdu Pandas', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('user-001', -18, 1394, 'unlock', 'art-012', 'Huangshan Mountain', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('user-001', -15, 1379, 'unlock', 'art-017', 'Hangzhou West Lake', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 其他用户的交易
('user-002', 150, 150, 'purchase', 'ord-002', 'Starter Package', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('user-002', 20, 170, 'signup_bonus', NULL, 'Welcome bonus', DATE_SUB(NOW(), INTERVAL 25 DAY)),
('user-002', 510, 680, 'purchase', 'ord-010', 'Explorer Package', DATE_SUB(NOW(), INTERVAL 5 DAY)),

('user-004', 2280, 2280, 'purchase', 'ord-003', 'Nomad Package', DATE_SUB(NOW(), INTERVAL 22 DAY)),
('user-004', 150, 2430, 'purchase', 'ord-009', 'Starter Package', DATE_SUB(NOW(), INTERVAL 8 DAY)),

('user-007', 150, 150, 'purchase', 'ord-013', 'Starter Package', DATE_SUB(NOW(), INTERVAL 21 DAY)),
('user-007', -150, 0, 'refund', 'ord-013', 'Order refunded', DATE_SUB(NOW(), INTERVAL 18 DAY)),

('user-008', 150, 150, 'purchase', 'ord-006', 'Starter Package', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('user-008', 510, 660, 'purchase', 'ord-014', 'Explorer Package', DATE_SUB(NOW(), INTERVAL 16 DAY)),
('user-008', -510, 150, 'refund', 'ord-014', 'Order refunded', DATE_SUB(NOW(), INTERVAL 12 DAY));

-- ============================================================
-- 5. 已解锁文章记录
-- ============================================================

INSERT INTO user_unlocked_articles (user_id, article_id, unlocked_at) VALUES
-- 用户 001 解锁的文章（最活跃）
('user-001', 'art-001', DATE_SUB(NOW(), INTERVAL 26 DAY)),
('user-001', 'art-002', DATE_SUB(NOW(), INTERVAL 24 DAY)),
('user-001', 'art-006', DATE_SUB(NOW(), INTERVAL 16 DAY)),
('user-001', 'art-008', DATE_SUB(NOW(), INTERVAL 14 DAY)),
('user-001', 'art-004', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('user-001', 'art-007', DATE_SUB(NOW(), INTERVAL 7 DAY)),
('user-001', 'art-005', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('user-001', 'art-010', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('user-001', 'art-012', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('user-001', 'art-017', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- 其他用户
('user-002', 'art-001', DATE_SUB(NOW(), INTERVAL 20 DAY)),
('user-004', 'art-006', DATE_SUB(NOW(), INTERVAL 15 DAY)),
('user-004', 'art-008', DATE_SUB(NOW(), INTERVAL 10 DAY)),
('user-006', 'art-004', DATE_SUB(NOW(), INTERVAL 12 DAY)),
('user-008', 'art-005', DATE_SUB(NOW(), INTERVAL 8 DAY)),
('user-009', 'art-010', DATE_SUB(NOW(), INTERVAL 6 DAY)),
('user-010', 'art-008', DATE_SUB(NOW(), INTERVAL 4 DAY));

-- ============================================================
-- 6. 广告数据（6 个广告位，各 1-2 个广告）
-- ============================================================

INSERT INTO advertisements (id, slot_id, title, image_url, target_url, is_active, start_date, end_date, priority, created_at) VALUES
-- AD-01: 首页顶部横幅
('ad-001', 'adslot-001', 'China Travel Insurance - Safe Journey', 'https://images.unsplash.com/photo-1436491865332-7a61a0cc7543?w=1200', 'https://example.com/insurance', true, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), 10, DATE_SUB(NOW(), INTERVAL 30 DAY)),
('ad-002', 'adslot-001', 'Beijing Airport Express - Fast Track', 'https://images.unsplash.com/photo-1436491865332-7a61a0cc7543?w=1200', 'https://example.com/airport', true, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 40 DAY), 5, DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- AD-02: 文章页侧边栏
('ad-003', 'adslot-002', 'Learn Chinese Online - 50% Off', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600', 'https://example.com/chinese', true, DATE_SUB(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), 8, DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- AD-03: 定价页
('ad-004', 'adslot-003', 'VPN for China Travelers - Stay Connected', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600', 'https://example.com/vpn', true, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 75 DAY), 7, DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- AD-04: 用户中心
('ad-005', 'adslot-004', 'Travel Gear Shop - 20% Off', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600', 'https://example.com/gear', true, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY), 6, DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- AD-05: 文章详情底部
('ad-006', 'adslot-005', 'Book Hotels in China - Best Rates', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'https://example.com/hotels', true, DATE_SUB(NOW(), INTERVAL 20 DAY), DATE_ADD(NOW(), INTERVAL 100 DAY), 9, DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- AD-06: 移动端横幅
('ad-007', 'adslot-006', 'eSIM for China - Stay Online', 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600', 'https://example.com/esim', true, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 5, DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ============================================================
-- 7. 更新文章浏览次数（模拟历史数据）
-- ============================================================

UPDATE articles SET view_count = FLOOR(view_count * (0.8 + RAND() * 0.4)) WHERE status = 'published';

-- ============================================================
-- 完成提示
-- ============================================================

SELECT '✅ 测试数据导入完成！' as status;
SELECT '📊 数据统计：' as info;
SELECT COUNT(*) as '用户数量' FROM users WHERE role = 'user';
SELECT COUNT(*) as '文章数量' FROM articles WHERE status = 'published';
SELECT COUNT(*) as '订单数量' FROM orders;
SELECT COUNT(*) as '积分交易' FROM point_transactions;
SELECT COUNT(*) as '已解锁文章' FROM user_unlocked_articles;
SELECT COUNT(*) as '广告数量' FROM advertisements WHERE is_active = true;
