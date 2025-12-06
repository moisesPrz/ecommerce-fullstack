/**
 * COMPARACIÓN VISUAL: BÚSQUEDA LINEAL vs BINARIA
 * Demostra por qué no se puede usar binaria en este caso
 */

public class ComparacionBusquedas {
    
    public static void main(String[] args) {
        int[] codigosDesordenados = {550, 130, 220, 550, 999, 220, 501, 130, 700};
        int[] codigosOrdenados = {130, 130, 220, 220, 501, 550, 550, 700, 999};
        
        System.out.println("╔═══════════════════════════════════════════════════════╗");
        System.out.println("║  ¿POR QUÉ NO SE PUEDE USAR BÚSQUEDA BINARIA?         ║");
        System.out.println("╚═══════════════════════════════════════════════════════╝\n");
        
        System.out.println("ARRAY ORIGINAL (DESORDENADO - Como se vende):");
        System.out.print("[");
        for (int i = 0; i < codigosDesordenados.length; i++) {
            System.out.print(codigosDesordenados[i]);
            if (i < codigosDesordenados.length - 1) System.out.print(", ");
        }
        System.out.println("]\n");
        
        System.out.println("Si intentamos BÚSQUEDA BINARIA en el array desordenado:");
        System.out.println("─────────────────────────────────────────────────────");
        System.out.println("Buscamos: 220");
        System.out.println();
        System.out.println("Paso 1: Mira el MEDIO (posición 4) = 999");
        System.out.println("        999 > 220 → Descarta la DERECHA");
        System.out.println("        Pero 220 ESTÁ en la derecha ❌");
        System.out.println("        ERROR: La búsqueda binaria FALLA\n");
        
        System.out.println("═══════════════════════════════════════════════════════\n");
        
        System.out.println("ARRAY ORDENADO (Si lo ordenáramos):");
        System.out.print("[");
        for (int i = 0; i < codigosOrdenados.length; i++) {
            System.out.print(codigosOrdenados[i]);
            if (i < codigosOrdenados.length - 1) System.out.print(", ");
        }
        System.out.println("]\n");
        
        System.out.println("Si usamos BÚSQUEDA BINARIA en array ordenado:");
        System.out.println("─────────────────────────────────────────────────────");
        System.out.println("Buscamos: 220");
        System.out.println();
        System.out.println("Paso 1: Mira el MEDIO (posición 4) = 501");
        System.out.println("        501 > 220 → Busca en IZQUIERDA [130, 130, 220, 220]");
        System.out.println();
        System.out.println("Paso 2: Mira el MEDIO de [130, 130, 220, 220]");
        System.out.println("        (posición 2) = 220");
        System.out.println("        220 = 220 ✓ ENCONTRADO\n");
        
        System.out.println("═══════════════════════════════════════════════════════\n");
        
        System.out.println("PERO... ¿Por qué no ordenamos?");
        System.out.println("─────────────────────────────");
        System.out.println("Problema 1: PÉRDIDA DE INFORMACIÓN");
        System.out.println("  - Los códigos registran el ORDEN DE VENTA");
        System.out.println("  - Si ordenamos, perdemos la cronología");
        System.out.println("  - La administradora NO sabría cuándo se vendió cada prenda\n");
        
        System.out.println("Problema 2: COMPLEJIDAD TOTAL");
        System.out.println("  - Ordenar: O(n log n)");
        System.out.println("  - Búsqueda binaria: O(log n)");
        System.out.println("  - Total: O(n log n) ← MÁS LENTO que lineal O(n)\n");
        
        System.out.println("Problema 3: CONTADOR DE FRECUENCIA");
        System.out.println("  - Búsqueda binaria solo encuentra UN elemento");
        System.out.println("  - Para contar frecuencia, igual necesitas recorrer todo → O(n)\n");
        
        System.out.println("═══════════════════════════════════════════════════════");
        System.out.println("\nCONCLUSIÓN: BÚSQUEDA LINEAL es la mejor opción");
        System.out.println("- Mantiene el orden de ventas");
        System.out.println("- Cuenta la frecuencia fácilmente");
        System.out.println("- Complejidad: O(n)");
    }
}
