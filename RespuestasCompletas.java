/**
 * RESPUESTAS COMPLETAS A LAS TAREAS
 * Detector de Errores en Precios del Supermercado
 * 
 * Datos: {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5}
 */

public class RespuestasCompletas {
    
    public static void main(String[] args) {
        
        System.out.println("╔═══════════════════════════════════════════════════════════════════════════╗");
        System.out.println("║          RESPUESTAS A LAS TAREAS - DETECTOR DE PRECIOS                  ║");
        System.out.println("╚═══════════════════════════════════════════════════════════════════════════╝\n");
        
        // ========== DATOS DEL PROBLEMA ==========
        System.out.println("DATOS DEL PROBLEMA:");
        System.out.println("───────────────────────────────────────────────────────────────────────────");
        System.out.println("Precios registrados: {12.5, 8.99, 8.99, 5.5, 12.5, 3.99, 8.99, 12.5}");
        System.out.println("Objetivo: Detectar precios repetidos (posible error o promoción)\n");
        
        
        // ========== TAREA 1 ==========
        System.out.println("═══════════════════════════════════════════════════════════════════════════");
        System.out.println("TAREA 1: Implementa un contador de frecuencia usando un mapa (HashMap)");
        System.out.println("═══════════════════════════════════════════════════════════════════════════\n");
        
        System.out.println("RESPUESTA:");
        System.out.println("──────────");
        System.out.println("""
import java.util.HashMap;

public static HashMap<Double, Integer> contarFrecuencias(double[] precios) {
    HashMap<Double, Integer> frecuencias = new HashMap<>();
    
    for (double precio : precios) {
        if (frecuencias.containsKey(precio)) {
            frecuencias.put(precio, frecuencias.get(precio) + 1);
        } else {
            frecuencias.put(precio, 1);
        }
    }
    
    return frecuencias;
}
        """);
        
        System.out.println("¿CÓMO FUNCIONA?");
        System.out.println("───────────────");
        System.out.println("1. Crea un HashMap vacío");
        System.out.println("2. Recorre cada precio del array");
        System.out.println("3. Si el precio YA existe en el mapa:");
        System.out.println("   → Suma 1 a su contador");
        System.out.println("4. Si el precio NO existe:");
        System.out.println("   → Lo agrega con contador = 1");
        System.out.println();
        
        System.out.println("RESULTADO:");
        System.out.println("──────────");
        System.out.println("$12.5  → 3 veces");
        System.out.println("$8.99  → 3 veces");
        System.out.println("$5.5   → 1 vez");
        System.out.println("$3.99  → 1 vez\n");
        
        
        // ========== TAREA 2 ==========
        System.out.println("═══════════════════════════════════════════════════════════════════════════");
        System.out.println("TAREA 2: Identifica el precio que más se repite");
        System.out.println("═══════════════════════════════════════════════════════════════════════════\n");
        
        System.out.println("RESPUESTA:");
        System.out.println("──────────");
        System.out.println("""
public static Double obtenerPrecioMasRepetido(HashMap<Double, Integer> frecuencias) {
    Double precioMasRepetido = null;
    int frecuenciaMaxima = 0;
    
    for (Map.Entry<Double, Integer> entrada : frecuencias.entrySet()) {
        if (entrada.getValue() > frecuenciaMaxima) {
            frecuenciaMaxima = entrada.getValue();
            precioMasRepetido = entrada.getKey();
        }
    }
    
    return precioMasRepetido;
}
        """);
        
        System.out.println("¿CÓMO FUNCIONA?");
        System.out.println("───────────────");
        System.out.println("1. Recorre cada entrada del HashMap");
        System.out.println("2. Compara la frecuencia con el máximo actual");
        System.out.println("3. Si es mayor, actualiza el máximo y guarda el precio");
        System.out.println("4. Retorna el precio con mayor frecuencia");
        System.out.println();
        
        System.out.println("RESULTADO:");
        System.out.println("──────────");
        System.out.println("PRECIO MÁS REPETIDO: $8.99 (o $12.5)");
        System.out.println("APARICIONES: 3 veces");
        System.out.println("ACCIÓN: Revisar si está mal digitado o en promoción\n");
        
        
        // ========== TAREA 3 ==========
        System.out.println("═══════════════════════════════════════════════════════════════════════════");
        System.out.println("TAREA 3: Explica por qué el HashMap tiene complejidad O(n)");
        System.out.println("═══════════════════════════════════════════════════════════════════════════\n");
        
        System.out.println("RESPUESTA:");
        System.out.println("──────────");
        System.out.println("""
El HashMap tiene complejidad O(n) porque:

1. RECORREMOS EL ARRAY UNA SOLA VEZ:
   - El bucle `for` itera sobre los n elementos del array
   - Complejidad: O(n)

2. OPERACIONES DENTRO DEL BUCLE:
   - containsKey(precio):     O(1) en promedio (búsqueda en tabla hash)
   - get(precio):             O(1) en promedio (acceso directo)
   - put(precio, valor):      O(1) en promedio (inserción en tabla hash)

3. CÁLCULO FINAL:
   O(n) iteraciones × O(1) por iteración = O(n)

CONCLUSIÓN:
El tiempo CRECE LINEALMENTE con el número de precios.
        """);
        
        System.out.println("\nEJEMPLO CON NÚMEROS:");
        System.out.println("────────────────────");
        System.out.println("Array de 8 precios    → ~8 operaciones");
        System.out.println("Array de 100 precios  → ~100 operaciones");
        System.out.println("Array de 1000 precios → ~1000 operaciones");
        System.out.println("\nVes la relación lineal? 2x precios = 2x operaciones\n");
        
        
        // ========== TAREA 4 ==========
        System.out.println("═══════════════════════════════════════════════════════════════════════════");
        System.out.println("TAREA 4: Describe qué pasa con la complejidad si usara una lista normal");
        System.out.println("═══════════════════════════════════════════════════════════════════════════\n");
        
        System.out.println("RESPUESTA:");
        System.out.println("──────────");
        System.out.println("""
Si usamos un ARRAY NORMAL en lugar de HashMap:

ALGORITMO CON ARRAY:
──────────────────
double[] preciosUnicos = new double[n];
int[] frecuencias = new int[n];

for (int i = 0; i < precios.length; i++) {
    boolean yaExiste = false;
    
    // BÚSQUEDA LINEAL en el array (¡AQUÍ ESTÁ EL PROBLEMA!)
    for (int j = 0; j < contador; j++) {
        if (preciosUnicos[j] == precios[i]) {
            frecuencias[j]++;
            yaExiste = true;
            break;
        }
    }
    
    if (!yaExiste) {
        preciosUnicos[contador] = precios[i];
        frecuencias[contador] = 1;
        contador++;
    }
}

ANÁLISIS DE COMPLEJIDAD:
───────────────────────
1. BUCLE EXTERNO: Recorre n precios           → O(n)
2. BUCLE INTERNO: Busca si ya existe          → O(n) en el peor caso
3. COMPLEJIDAD TOTAL: O(n) × O(n)             → O(n²) ¡CUADRÁTICA!

EJEMPLO PRÁCTICO:
────────────────
Con 8 precios:     8 × 8 = 64 comparaciones
Con 100 precios:   100 × 100 = 10,000 comparaciones
Con 1000 precios:  1000 × 1000 = 1,000,000 comparaciones ❌ ¡LENTÍSIMO!

COMPARATIVA: HASHMAP vs ARRAY NORMAL
────────────────────────────────────
Precios | HashMap (O(n)) | Array Normal (O(n²))
--------|---|---
8       | 8  | 64
100     | 100 | 10,000
1000    | 1,000 | 1,000,000
10000   | 10,000 | 100,000,000

¿POR QUÉ ES TAN LENTO CON ARRAY?
─────────────────────────────────
- Para CADA precio, tienes que BUSCAR si ya existe
- Esa búsqueda requiere comparar con todos los anteriores
- En el peor caso, comparas n veces para n precios
- Resultado: n × n = n² operaciones

¿POR QUÉ ES RÁPIDO CON HASHMAP?
─────────────────────────────────
- El HashMap usa una tabla hash interna
- La búsqueda es O(1) en promedio (acceso directo)
- No necesita comparar con todos los anteriores
- Resultado: n × 1 = n operaciones

CONCLUSIÓN:
───────────
Para contar frecuencias, SIEMPRE usa HashMap (u otro mapa hash)
en lugar de arrays con búsqueda lineal.
La diferencia es EXPONENCIAL en arrays grandes.
        """);
        
        
        // ========== RESUMEN FINAL ==========
        System.out.println("\n═══════════════════════════════════════════════════════════════════════════");
        System.out.println("RESUMEN FINAL");
        System.out.println("═══════════════════════════════════════════════════════════════════════════\n");
        
        System.out.println("✓ TAREA 1: HashMap contador de frecuencia → Funciona correctamente");
        System.out.println("  Resultado: $8.99 y $12.5 aparecen 3 veces cada uno");
        System.out.println();
        
        System.out.println("✓ TAREA 2: Precio más repetido identificado");
        System.out.println("  Acción: Revisar si está mal digitado o en promoción");
        System.out.println();
        
        System.out.println("✓ TAREA 3: HashMap es O(n)");
        System.out.println("  Razón: 1 recorrido del array × O(1) por operación = O(n)");
        System.out.println();
        
        System.out.println("✓ TAREA 4: Array normal sería O(n²)");
        System.out.println("  Razón: Búsqueda lineal para cada elemento = n × n = n²");
        System.out.println("  Conclusión: ¡HashMap es mucho más eficiente!");
        System.out.println();
    }
}
