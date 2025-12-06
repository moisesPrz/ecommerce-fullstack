/**
 * TAREA 4: ¿QUÉ PASA CON LA COMPLEJIDAD SI USARA UNA LISTA NORMAL?
 * 
 * Explicación paso a paso de por qué un array normal es O(n²)
 * y cómo se compara con HashMap O(n)
 */

public class Tarea4ExplicacionDetallada {
    
    public static void main(String[] args) {
        
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║  TAREA 4: COMPLEJIDAD CON LISTA/ARRAY NORMAL                 ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");
        
        double[] precios = {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5};
        
        System.out.println("DATOS:");
        System.out.println("──────");
        System.out.println("Precios: {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5}");
        System.out.println("Total: 8 elementos\n");
        
        
        // ========== MÉTODO CON ARRAY NORMAL ==========
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("MÉTODO CON ARRAY NORMAL (Ineficiente)");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("CÓDIGO:");
        System.out.println("───────");
        System.out.println("""
double[] preciosUnicos = new double[precios.length];
int[] contadores = new int[precios.length];
int cantidadUnicos = 0;

// BUCLE EXTERNO: Para cada precio en el array original
for (int i = 0; i < precios.length; i++) {
    boolean yaExiste = false;
    
    // BUCLE INTERNO: Búsqueda lineal
    // Pregunta: ¿Este precio ya lo registramos?
    for (int j = 0; j < cantidadUnicos; j++) {
        if (preciosUnicos[j] == precios[i]) {
            contadores[j]++;     // Incrementa contador
            yaExiste = true;
            break;
        }
    }
    
    // Si no lo encontramos, lo agregamos
    if (!yaExiste) {
        preciosUnicos[cantidadUnicos] = precios[i];
        contadores[cantidadUnicos] = 1;
        cantidadUnicos++;
    }
}
        """);
        
        System.out.println("\n¿POR QUÉ ESTE CÓDIGO ES O(n²)?");
        System.out.println("──────────────────────────────────────────────────────────────\n");
        
        System.out.println("PASO A PASO CON NUESTROS 8 PRECIOS:");
        System.out.println();
        
        double[] preciosUnicos = new double[precios.length];
        int[] contadores = new int[precios.length];
        int cantidadUnicos = 0;
        int totalComparaciones = 0;
        
        for (int i = 0; i < precios.length; i++) {
            boolean yaExiste = false;
            int comparacionesEnEstaIteracion = 0;
            
            System.out.println("PASO " + (i + 1) + ": Procesando precio " + precios[i]);
            System.out.println("─────────────────────────");
            
            // BÚSQUEDA LINEAL: comparar con todos los anteriores
            for (int j = 0; j < cantidadUnicos; j++) {
                comparacionesEnEstaIteracion++;
                totalComparaciones++;
                System.out.println("  ¿" + precios[i] + " == " + preciosUnicos[j] + "? " + 
                    (precios[i] == preciosUnicos[j] ? "SÍ ✓" : "NO ✗"));
                
                if (precios[i] == preciosUnicos[j]) {
                    contadores[j]++;
                    yaExiste = true;
                    break;
                }
            }
            
            if (!yaExiste) {
                System.out.println("  → No existe, lo agregamos");
                preciosUnicos[cantidadUnicos] = precios[i];
                contadores[cantidadUnicos] = 1;
                cantidadUnicos++;
            } else {
                System.out.println("  → Ya existe, incrementamos contador");
            }
            
            System.out.println("  Comparaciones en este paso: " + comparacionesEnEstaIteracion);
            System.out.println();
        }
        
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("ANÁLISIS DEL RESULTADO");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("TOTAL DE COMPARACIONES REALIZADAS: " + totalComparaciones);
        System.out.println();
        
        // Mostrar tabla de comparaciones
        System.out.println("TABLA DE COMPARACIONES POR PASO:");
        System.out.println("────────────────────────────────");
        System.out.println("Paso | Precio | Comparaciones | Precios únicos registrados");
        System.out.println("─────┼────────┼───────────────┼─────────────────────────────");
        System.out.println("  1  | 12.5   |       0       | []");
        System.out.println("  2  | 8.99   |       1       | [12.5]");
        System.out.println("  3  | 8.99   |       2       | [12.5, 8.99]");
        System.out.println("  4  | 5.5    |       2       | [12.5, 8.99]");
        System.out.println("  5  | 12.5   |       3       | [12.5, 8.99, 5.5]");
        System.out.println("  6  | 3.99   |       3       | [12.5, 8.99, 5.5]");
        System.out.println("  7  | 8.99   |       4       | [12.5, 8.99, 5.5, 3.99]");
        System.out.println("  8  | 12.5   |       4       | [12.5, 8.99, 5.5, 3.99]");
        System.out.println();
        System.out.println("TOTAL: 0+1+2+2+3+3+4+4 = " + totalComparaciones + " comparaciones");
        System.out.println();
        
        
        // ========== ANÁLISIS MATEMÁTICO ==========
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("ANÁLISIS MATEMÁTICO");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("¿POR QUÉ O(n²) Y NO O(n)?");
        System.out.println("────────────────────────────");
        System.out.println();
        System.out.println("Estructura del código:");
        System.out.println("┌─ BUCLE EXTERNO (n iteraciones)");
        System.out.println("│   for (int i = 0; i < precios.length; i++)");
        System.out.println("│");
        System.out.println("│   ┌─ BUCLE INTERNO (hasta n iteraciones)");
        System.out.println("│   │   for (int j = 0; j < cantidadUnicos; j++)");
        System.out.println("│   │       // Comparación: O(1)");
        System.out.println("│   └─");
        System.out.println("└─");
        System.out.println();
        System.out.println("Complejidad Total:");
        System.out.println("  O(n) × O(n) = O(n²)");
        System.out.println();
        System.out.println("Por cada elemento (n elementos):");
        System.out.println("  → Haces una búsqueda lineal (n comparaciones en el peor caso)");
        System.out.println("  → Multiplicas n × n = n²");
        System.out.println();
        
        
        // ========== COMPARACIÓN VISUAL ==========
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("COMPARACIÓN: ARRAY vs HASHMAP");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("Para 8 precios:");
        System.out.println("──────────────");
        System.out.println("ARRAY:    8 × 8 = 64 comparaciones");
        System.out.println("HASHMAP:  8 × 1 = 8 operaciones");
        System.out.println("Diferencia: 64 / 8 = 8 VECES MÁS LENTO");
        System.out.println();
        
        System.out.println("Para 100 precios:");
        System.out.println("────────────────");
        System.out.println("ARRAY:    100 × 100 = 10,000 comparaciones");
        System.out.println("HASHMAP:  100 × 1 = 100 operaciones");
        System.out.println("Diferencia: 10,000 / 100 = 100 VECES MÁS LENTO");
        System.out.println();
        
        System.out.println("Para 1,000 precios:");
        System.out.println("──────────────────");
        System.out.println("ARRAY:    1,000 × 1,000 = 1,000,000 comparaciones ❌");
        System.out.println("HASHMAP:  1,000 × 1 = 1,000 operaciones ✓");
        System.out.println("Diferencia: 1,000,000 / 1,000 = 1,000 VECES MÁS LENTO");
        System.out.println();
        
        System.out.println("Para 10,000 precios:");
        System.out.println("───────────────────");
        System.out.println("ARRAY:    10,000 × 10,000 = 100,000,000 comparaciones ❌❌❌");
        System.out.println("HASHMAP:  10,000 × 1 = 10,000 operaciones ✓");
        System.out.println("Diferencia: 100,000,000 / 10,000 = 10,000 VECES MÁS LENTO");
        System.out.println();
        
        
        // ========== TABLA COMPARATIVA ==========
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("TABLA COMPARATIVA COMPLETA");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("Tamaño | ARRAY (O(n²)) | HASHMAP (O(n)) | Ratio (Array/HashMap)");
        System.out.println("──────┼───────────────┼────────────────┼──────────────────────");
        System.out.println("  8   |      64       |        8       |         8x");
        System.out.println(" 10   |     100       |       10       |        10x");
        System.out.println(" 50   |    2,500      |       50       |        50x");
        System.out.println("100   |    10,000     |      100       |       100x");
        System.out.println("500   |   250,000     |      500       |       500x");
        System.out.println("1K    |  1,000,000    |    1,000       |     1,000x");
        System.out.println("5K    | 25,000,000    |    5,000       |     5,000x");
        System.out.println("10K   |100,000,000    |   10,000       |    10,000x");
        System.out.println();
        
        
        // ========== CONCLUSIÓN ==========
        System.out.println("═══════════════════════════════════════════════════════════════");
        System.out.println("CONCLUSIÓN");
        System.out.println("═══════════════════════════════════════════════════════════════\n");
        
        System.out.println("1. ARRAY NORMAL es O(n²)");
        System.out.println("   ✗ Necesita búsqueda lineal para cada elemento");
        System.out.println("   ✗ Complejidad crece exponencialmente");
        System.out.println("   ✗ Para 1K precios: 1 MILLÓN de comparaciones");
        System.out.println();
        
        System.out.println("2. HASHMAP es O(n)");
        System.out.println("   ✓ Búsqueda constante O(1) por elemento");
        System.out.println("   ✓ Complejidad crece linealmente");
        System.out.println("   ✓ Para 1K precios: solo 1,000 operaciones");
        System.out.println();
        
        System.out.println("3. LA DIFERENCIA ES ENORME");
        System.out.println("   ✗ Con 1K precios: Array es 1,000x más lento");
        System.out.println("   ✗ Con 10K precios: Array es 10,000x más lento");
        System.out.println("   ✓ SIEMPRE usa HashMap para contar frecuencias");
        System.out.println();
    }
}
