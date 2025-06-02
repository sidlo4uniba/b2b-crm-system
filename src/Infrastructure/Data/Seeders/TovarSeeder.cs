using CRMBackend.Domain.AggregateRoots.DodavatelAggregate; 
using CRMBackend.Domain.AggregateRoots.KategoriaProduktuAggregate;
using CRMBackend.Domain.AggregateRoots.TovarAggregate;
using CRMBackend.Domain.Exceptions;
using CRMBackend.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRMBackend.Infrastructure.Data.Seeders
{
    public class TovarSeeder : IDataSeeder
    {
        public int Order => 3; 

        
        private static class CategoryNames
        {
            public const string Tricka = "Tričká";
            public const string Nohavice = "Nohavice";
            public const string Kancelaria = "Kancelária";
            public const string Obuv = "Obuv";
            public const string TaskyBatohy = "Tašky a batohy";
            public const string ModneDoplnky = "Módne doplnky";
            public const string Domacnost = "Domácnosť";
            public const string Elektronika = "Elektronika";
            public const string SportovePotreby = "Športové potreby";
            public const string Kozmetika = "Kozmetika";
            public const string Zdravie = "Zdravie";
            public const string Knihy = "Knihy";
        }

        
        private static readonly List<KategoriaProduktu> InitialKategorie = new()
        {
            new KategoriaProduktu { Nazov = CategoryNames.Tricka },
            new KategoriaProduktu { Nazov = CategoryNames.Nohavice },
            new KategoriaProduktu { Nazov = CategoryNames.Kancelaria },
            new KategoriaProduktu { Nazov = CategoryNames.Obuv },
            new KategoriaProduktu { Nazov = CategoryNames.TaskyBatohy },
            new KategoriaProduktu { Nazov = CategoryNames.ModneDoplnky },
            new KategoriaProduktu { Nazov = CategoryNames.Domacnost },
            new KategoriaProduktu { Nazov = CategoryNames.Elektronika },
            new KategoriaProduktu { Nazov = CategoryNames.SportovePotreby },
            new KategoriaProduktu { Nazov = CategoryNames.Kozmetika },
            new KategoriaProduktu { Nazov = CategoryNames.Zdravie },
        };

        
        private static readonly Dictionary<string, List<string>> _productNamesByCategory = new()
        {
            [CategoryNames.Tricka] = new List<string> {
                "Pánske tričko Classic Crew", "Dámske tričko V-Neck Essential", "Detské tričko Basic Fun", "Unisex tričko Organic Cotton",
                "Polokošeľa Pique Performance", "Tričko s dlhým rukávom Thermal", "Funkčné tričko Active Dry", "Športové tielko Runner",
                "Dámske tielko Silk Touch", "Oversize tričko Street Style", "Tričko s potlačou Vintage Graphic", "Crop Top Summer Vibes",
                "Pánske tielko Muscle Fit", "Detské tričko s kapucňou", "Raglanové tričko Baseball Style", "Termo tričko Base Layer",
                "Dámska tunika Flowy", "Pánska polokošeľa Golf Pro", "Tričko s okrúhlym výstrihom Slim Fit", "Dámske tričko Boat Neck"
                
            },
            [CategoryNames.Nohavice] = new List<string> {
                "Pánske džínsy Slim Fit", "Dámske legíny High Waist", "Chinos nohavice Casual", "Cargo nohavice Utility",
                "Tepláky Fleece Jogger", "Spoločenské nohavice Classic Suit", "Dámske nohavice Wide Leg", "Pánske kraťasy Bermuda",
                "Dámske šortky Denim Cutoff", "Turistické nohavice Outdoor Explorer", "Lyžiarske nohavice Insulated", "Bežecké legíny Compression",
                "Pracovné nohavice Durable Workwear", "Ľanové nohavice Summer Breeze", "Menčestrové nohavice Corduroy", "Pánske plátené nohavice",
                "Dámske capri nohavice", "Pyžamové nohavice Cozy Night", "Jazdecké nohavice Breeches", "Nepremokavé nohavice Rain Gear"
                
            },
            [CategoryNames.Kancelaria] = new List<string> {
                "Guľôčkové pero Executive", "Zvýrazňovač Neon Set", "Poznámkový blok Spiral A5", "Samolepiace bločky Sticky Notes",
                "Kancelárska sponka Box", "Zošívačka Heavy Duty", "Dierovač Double Hole", "Stojan na perá Mesh Organizer",
                "Odkladač na dokumenty Stackable Tray", "Archivačný box Cardboard", "Rýchloviazač Plastic Folder", "Rezačka papiera Rotary Trimmer",
                "Kalkulačka Desktop Solar", "Tabuľa biela Magnetic Whiteboard", "Flipchart stojan Easel", "Lepiaca páska Transparent Tape Dispenser",
                "Nožnice Office Standard", "Pečiatka samonamáčacia Custom Stamp", "Skartovačka Cross-Cut Shredder", "Laminátor Thermal A4"
                
            },
            [CategoryNames.Obuv] = new List<string> {
                "Pánske tenisky Urban Sneaker", "Dámske lodičky Classic Pump", "Bežecká obuv Trail Runner", "Turistická obuv Waterproof Hiker",
                "Sandále Leather Comfort", "Šľapky Pool Slide", "Papuče Cozy Indoor", "Pracovná obuv Steel Toe Boot",
                "Spoločenská obuv Oxford Dress", "Dámske čižmy Knee-High", "Snežule Winter Grip", "Balerínky Flat Bow",
                "Mokasíny Driving Loafer", "Espadrilky Canvas Slip-on", "Tenisky na platforme", "Detské tenisky Velcro Strap",
                "Gumáky Rain Wellies", "Cyklistické tretry SPD Cleat", "Lezečky Climbing Shoe", "Ortopedická obuv Support Walker"
                 
           },
            [CategoryNames.TaskyBatohy] = new List<string> {
                "Mestský batoh Laptop Commuter", "Turistický batoh Expedition 60L", "Školský batoh Kids Fun", "Dámska kabelka Tote Bag",
                "Crossbody taška Urban Messenger", "Športová taška Gym Duffle", "Cestovný kufor Hardshell Spinner", "Taška na notebook Briefcase",
                "Nákupná taška Eco Shopper", "Ľadvinka Waist Pack", "Kozmetická taštička Travel Kit", "Puzdro na tablet Sleeve Case",
                "Batoh na fotoaparát DSLR Pro", "Cyklistický batoh Hydration Pack", "Plážová taška Straw Tote", "Piknikový kôš Wicker Basket",
                "Taška na rakety Tennis Bag", "Hudobný nástroj Gig Bag", "Rybársky batoh Tackle Box", "Vak na prezúvky Drawstring Bag"
                 
           },
            [CategoryNames.ModneDoplnky] = new List<string> {
                "Kožený opasok Classic Buckle", "Hodinky Analog Quartz", "Slnečné okuliare Aviator Style", "Šatka Silk Scarf",
                "Čiapka Beanie Knit", "Rukavice Leather Gloves", "Náhrdelník Silver Pendant", "Náramok Beaded Bracelet",
                "Náušnice Stud Earrings", "Prsteň Gemstone Ring", "Kravata Silk Tie", "Motýlik Bow Tie",
                "Manžetové gombíky Cufflinks Set", "Peňaženka Bifold Wallet", "Kľúčenka Leather Keychain", "Traky Suspenders Classic",
                "Vreckovka do saka Pocket Square", "Brošňa Vintage Brooch", "Štipec na kravatu Tie Clip", "Čelenka Hair Band"
                 
           },
            [CategoryNames.Domacnost] = new List<string> {
                "Sada tanierov Porcelain Dinnerware", "Poháre na víno Crystal Glass Set", "Príborová sada Stainless Steel", "Kuchynský nôž Chef Knife",
                "Panvica Non-stick Frypan", "Hrniec Stainless Steel Pot", "Mixér Stolný Blender", "Rýchlovarná kanvica Electric Kettle",
                "Hriankovač Toaster Classic", "Kávovar Espresso Machine", "Uterák Bath Towel Cotton", "Posteľná bielizeň Satin Sheet Set",
                "Vankúš Memory Foam Pillow", "Prikrývka Duvet All-Season", "Vysávač Bagless Vacuum", "Žehlička Steam Iron",
                "Odpadkový kôš Pedal Bin", "Sviečka vonná Aroma Candle", "Rám na obraz Photo Frame", "Váza sklenená Flower Vase"
                 
           },
            [CategoryNames.Elektronika] = new List<string> {
                "Notebook Ultra Thin Laptop", "Smartfón Flagship Model", "Tablet Pro Series", "Bezdrôtové slúchadlá Noise Cancelling",
                "Bluetooth reproduktor Portable Speaker", "Smart hodinky Fitness Tracker", "Herná konzola Next Gen Console", "Monitor 4K Ultra HD",
                "Klávesnica mechanická RGB", "Myš bezdrôtová Ergonomic Mouse", "Webkamera Full HD Webcam", "Externý disk SSD Portable",
                "USB kľúč Flash Drive High Speed", "Powerbanka Fast Charge", "Router Wi-Fi 6 Mesh", "Tlačiareň multifunkčná Inkjet",
                "Projektor Home Cinema", "Digitálny fotoaparát Mirrorless Camera", "Akčná kamera Waterproof Action Cam", "Čítačka elektronických kníh E-Reader"
                 
           },
            [CategoryNames.SportovePotreby] = new List<string> {
                "Futbalová lopta Official Match Ball", "Basketbalová lopta Indoor/Outdoor", "Tenisová raketa Graphite Pro", "Bedmintonový set Family",
                "Golfová palica Driver Titanium", "Hokejka Composite Stick", "Cyklistická prilba Aero Helmet", "Plavecké okuliare Anti-Fog",
                "Potápačská maska Snorkel Set", "Činky sada Dumbbell Set", "Posilňovacia lavica Bench Press", "Bežecký pás Treadmill Home",
                "Eliptický trenažér Cross Trainer", "Švihadlo Speed Rope", "Podložka na cvičenie Yoga Mat", "Fitlopta Exercise Ball",
                "Odporové gumy Resistance Bands", "Boxovacie vrece Punching Bag", "Korčule kolieskové Inline Skates", "Lyže Carving Skis"
                 
            },
            [CategoryNames.Kozmetika] = new List<string> {
                "Hydratačný krém Daily Moisturizer", "Čistiaci gél Facial Cleanser", "Pleťové sérum Anti-Aging Serum", "Očný krém Revitalizing Eye Cream",
                "Make-up Foundation Liquid", "Riasenka Volumizing Mascara", "Rúž na pery Matte Lipstick", "Očné tiene Eyeshadow Palette",
                "Šampón pre objem Volume Shampoo", "Kondicionér Repair Conditioner", "Sprchový gél Refreshing Shower Gel", "Telové mlieko Body Lotion Shea Butter",
                "Krém na ruky Hand Cream Intensive", "Opaľovací krém Sunscreen SPF 50", "Parfém Eau de Parfum Floral", "Deodorant Roll-on Antiperspirant",
                "Mydlo tuhé Natural Soap Bar", "Pena na holenie Shaving Foam Sensitive", "Voda po holení After Shave Balm", "Lak na nechty Nail Polish Gel Effect"
                 
            },
            [CategoryNames.Zdravie] = new List<string> {
                "Vitamín C tablety Immune Support", "Multivitamín Daily Complete", "Omega-3 kapsule Fish Oil", "Probiotiká Digestive Health",
                "Magnézium tablety Muscle Relax", "Železo doplnok Iron Supplement", "Vápnik + D3 Bone Health", "Kolagén prášok Joint & Skin",
                "Bylinný čaj Relaxing Blend", "Tlakomer digitálny Blood Pressure Monitor", "Teplomer bezkontaktný Infrared Thermometer", "Glukomer Blood Glucose Meter",
                "Inhalátor Nebulizer", "Bandáž elastická Elastic Bandage", "Náplaste rôzne veľkosti Adhesive Bandages", "Dezinfekčný gél na ruky Hand Sanitizer",
                "Masážny olej Relaxing Massage Oil", "Výhrevná poduška Heating Pad", "Ortopedický vankúš Cervical Pillow", "Chrániče sluchu Ear Plugs"
                 
            }
            
        };


        public async Task SeedAsync(ApplicationDbContext dbContext)
        {        
            Console.WriteLine("Seeding initial KategorieProduktov...");
            dbContext.KategorieProduktov.AddRange(InitialKategorie);
            await dbContext.SaveChangesAsync();

            
            var dodavatelia = await dbContext.Dodavatelia.ToListAsync();
            var kategorie = await dbContext.KategorieProduktov.ToListAsync();

            Console.WriteLine("Seeding initial Tovar...");

            var random = new Random();
            var tovaryToAdd = new List<Tovar>();
            int totalProductsGenerated = 0;

            
            foreach (var kategoria in kategorie)
            {
                if (_productNamesByCategory.TryGetValue(kategoria.Nazov, out var productNames))
                {                    
                    int productsToGenerateForCategory = Math.Max(20, productNames.Count); 


                    for (int i = 0; i < productsToGenerateForCategory; i++)
                    {
                        
                        string nazov = productNames[i % productNames.Count];

                        
                        var dodavatel = dodavatelia[random.Next(dodavatelia.Count)];

                        
                        var cena = random.Next(5, 500) + (decimal)Math.Round(random.NextDouble(), 2); 

                        
                        var tovar = new Tovar
                        {
                            InterneId = $"T-{random.Next(10, 100):00}-{GenerateRandomLetters(random, 6)}",
                            Nazov = nazov,
                            Kategoria = kategoria, 
                            KategoriaId = kategoria.Id, 
                            Cena = cena,
                            Dodavatel = dodavatel, 
                        };

                        
                        if (random.Next(3) == 0) 
                        {
                            
                            long eanValue = (long)(random.NextDouble() * 9000000000000L) + 1000000000000L;
                            tovar.SetEan(eanValue.ToString());
                        }

                        tovaryToAdd.Add(tovar);
                        totalProductsGenerated++;
                    }
                }
            }

            
            if (tovaryToAdd.Any())
            {
                await dbContext.Tovary.AddRangeAsync(tovaryToAdd);
                await dbContext.SaveChangesAsync();
                
                await AddVariantsToProducts(dbContext, random);
            }
        }
        
        private async Task AddVariantsToProducts(ApplicationDbContext dbContext, Random random)
        {
            var allProducts = await dbContext.Tovary.ToListAsync();
            
            var productsForVariants = allProducts
                .OrderBy(_ => random.Next())
                .Take(allProducts.Count / 2)
                .ToList();
                            
            foreach (var product in productsForVariants)
            {
                var usedCombinations = new HashSet<(string?, Velkost?)>();
                int variantType = random.Next(1, 4);
                int variantCount = random.Next(1, 6);
                int attemptsLimit = variantCount * 3;
                int currentAttempts = 0;
                
                while (usedCombinations.Count < variantCount && currentAttempts < attemptsLimit)
                {
                    currentAttempts++;
                    
                    string? colorHex = null;
                    Velkost? size = null;
                    
                    if (variantType == 2 || variantType == 3)
                        colorHex = GenerateRandomHexColor(random);
                    
                    if (variantType == 1 || variantType == 3)
                        size = GetRandomSize(random);
                    
                    var combination = (colorHex, size);
                    
                    if (usedCombinations.Contains(combination))
                        continue;
                        
                    usedCombinations.Add(combination);
                    
                    var variant = new VariantTovar(colorHex, size)
                    {
                        Tovar = product,
                        TovarId = product.Id,
                        Cena = random.Next(5) == 0 ? product.Cena * (decimal)(0.8 + random.NextDouble() * 0.4) : product.Cena
                    };
                    
                    product.AddVariant(variant);
                }
            }
            
            await dbContext.SaveChangesAsync();
        }
        
        private string GenerateRandomHexColor(Random random)
        {
            byte[] rgb = new byte[3];
            random.NextBytes(rgb);
            return $"#{rgb[0]:X2}{rgb[1]:X2}{rgb[2]:X2}";
        }
        
        private Velkost GetRandomSize(Random random)
        {
            var sizes = new[] { Velkost.XS, Velkost.S, Velkost.M, Velkost.L, Velkost.XL, Velkost.XXL };
            return sizes[random.Next(sizes.Length)];
        }

        private string GenerateRandomLetters(Random random, int length)
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
