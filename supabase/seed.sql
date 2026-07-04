-- Datos demo basados en data/mock*.ts (solo desarrollo local con supabase db reset)

insert into public.lost_pets (name, breed, color, location, date_text, description, reward, contact, status)
values
  ('Rocky', 'Pastor Alemán', 'Café con blanco', 'San Benito, San Salvador', 'Hace 2 días', 'Perro mediano, muy cariñoso, con collar azul. Responde al nombre Rocky.', '$100', '+503 7123-4567', 'urgent'),
  ('Mimi', 'Gato Persa', 'Blanco y gris', 'Antiguo Cuscatlán', 'Hace 5 días', 'Gata pequeña, collar rojo con campana. Tímida pero amigable.', '$50', '+503 7234-5678', 'normal'),
  ('Firulais', 'Cocker Spaniel', 'Marrón', 'Soyapango', 'Hace 1 semana', 'Perro pequeño, muy travieso. Lleva collar amarillo fluorescente.', '$150', '+503 7345-6789', 'critical');

insert into public.found_pets (type, breed, color, location, date_text, description, condition, contact, match, status)
values
  ('Perro mediano', 'Labrador mix', 'Dorado con pecho blanco', 'Colonia Escalón, San Salvador', 'Encontrado hoy', 'Muy dócil, llevaba collar negro sin placa. Parece estar acostumbrado a estar con personas.', 'Buen estado', '+503 7456-7890', 'Alta coincidencia con Rocky', 'high'),
  ('Gata pequeña', 'Doméstica pelo corto', 'Blanco y gris', 'Antiguo Cuscatlán', 'Hace 1 día', 'Gata asustada pero sana. Tiene campanita roja y fue resguardada temporalmente.', 'Resguardada', '+503 7567-8901', 'Posible coincidencia con Mimi', 'medium'),
  ('Cachorro', 'Criollo', 'Negro con café', 'Santa Tecla', 'Hace 3 días', 'Encontrado cerca de una parada de buses. Necesita hogar temporal o contacto de su familia.', 'Necesita revisión', '+503 7678-9012', 'Sin coincidencias claras', 'normal');

insert into public.campaigns (title, description, goal, current, donors, days_left, organization, status, updates)
values
  ('Luna necesita cirugía de urgencia', 'Luna fue atropellada y requiere cirugía ortopédica urgente. Ayuda a salvar su vida.', 500, 385, 24, 5, 'Rescate Perritos SV', 'urgent', 3),
  ('Alimento para 50 perros rescatados', 'La fundación necesita alimento de calidad para los 50 perros en el refugio durante el mes.', 300, 180, 12, 15, 'Huellitas Salvadoreñas', 'normal', 2),
  ('Campaña de esterilización comunitaria', 'Jornada de esterilización para controlar la población de mascotas callejeras en Apopa.', 800, 650, 38, 8, 'Veterinarios por la Vida', 'success', 5),
  ('Medicinas para gatos enfermos', 'Necesitamos antibióticos y medicinas para tratar a los gatos con infecciones respiratorias.', 200, 95, 8, 20, 'Rescate Felino SV', 'normal', 1);

insert into public.food_prices (brand, weight, price, store, available)
values
  ('Dog Chow Adulto', '8 lb', 18.5, 'PetMarket SV', 'Disponible'),
  ('Pro Plan Puppy', '6 lb', 32.0, 'Animal Store', 'Pocas unidades'),
  ('Cat Chow Gatitos', '3 kg', 21.75, 'Huellitas Shop', 'Disponible'),
  ('NutriCan Adulto', '10 lb', 16.99, 'Agroservicio Central', 'Disponible');

insert into public.vets (name, services, location, phone, hours, promo)
values
  ('Clínica Veterinaria Huellitas', 'Emergencias, Vacunación, Cirugía', 'San Salvador', '+503 2212-3344', 'Lun-Sáb 8:00 AM - 6:00 PM', '10% en consulta para rescatistas'),
  ('VetCare Santa Tecla', 'Consulta general, Esterilización, Laboratorio', 'Santa Tecla', '+503 2288-1100', 'Todos los días 7:00 AM - 7:00 PM', 'Jornada de vacunación mensual'),
  ('Animalia 24/7', 'Emergencias 24/7, Hospitalización, Rayos X', 'Antiguo Cuscatlán', '+503 7000-2424', '24 horas', 'Aliada en casos urgentes verificados');
