using System.Reflection;
using System.Text;

namespace DtoTypeGenerator;

class Program
{
    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("Usage: dotnet run <output-file-path>");
            Console.WriteLine("Example: dotnet run ../../../shared/src/generated/dtos.ts");
            Environment.Exit(1);
        }

        string outputPath = args[0];
        Console.WriteLine($"Generating TypeScript DTOs to: {outputPath}");

        try
        {
            // Lade das Backend-Assembly
            var backendAssembly = LoadBackendAssembly();
            
            // Sammle alle DTO-Types aus Models.Dtos Namespace
            var dtoTypes = backendAssembly.GetTypes()
                .Where(t => t.Namespace != null && 
                           t.Namespace.EndsWith(".Models.Dtos") &&
                           (t.IsClass || t.IsValueType) &&
                           !t.IsAbstract &&
                           t.IsPublic)
                .OrderBy(t => t.Name)
                .ToList();

            Console.WriteLine($"Found {dtoTypes.Count} DTO types");

            // Generiere TypeScript-Code
            var tsCode = GenerateTypeScriptCode(dtoTypes);

            // Schreibe in Output-Datei
            var outputDir = Path.GetDirectoryName(outputPath);
            if (!string.IsNullOrEmpty(outputDir) && !Directory.Exists(outputDir))
            {
                Directory.CreateDirectory(outputDir);
            }

            File.WriteAllText(outputPath, tsCode);
            Console.WriteLine($"✅ Successfully generated TypeScript DTOs: {dtoTypes.Count} interfaces");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error: {ex.Message}");
            Environment.Exit(1);
        }
    }

    static Assembly LoadBackendAssembly()
    {
        // Finde das Backend-Assembly im bin-Ordner
        var currentDir = AppDomain.CurrentDomain.BaseDirectory;
        var backendAssemblyPath = Directory.GetFiles(currentDir, "ct-appportal-azfunctions.dll", SearchOption.AllDirectories).FirstOrDefault();

        if (backendAssemblyPath == null)
        {
            throw new FileNotFoundException("Backend assembly not found. Run 'dotnet build' first.");
        }

        Console.WriteLine($"Loading assembly: {backendAssemblyPath}");
        return Assembly.LoadFrom(backendAssemblyPath);
    }

    static string GenerateTypeScriptCode(List<Type> dtoTypes)
    {
        var sb = new StringBuilder();

        // Header
        sb.AppendLine("// ============================================");
        sb.AppendLine("// AUTOMATISCH GENERIERT — NICHT MANUELL EDITIEREN");
        sb.AppendLine("// ============================================");
        sb.AppendLine("// Diese Datei wird automatisch aus C# DTOs generiert via:");
        sb.AppendLine("// npm run generate:types");
        sb.AppendLine("//");
        sb.AppendLine("// Quelle: packages/backend/Models/Dtos/");
        sb.AppendLine("// Generator: packages/backend/Tools/DtoTypeGenerator/");
        sb.AppendLine($"// Generiert: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
        sb.AppendLine("// ============================================");
        sb.AppendLine();

        // Generiere Interface für jeden DTO-Type
        foreach (var type in dtoTypes)
        {
            sb.AppendLine(GenerateInterface(type));
        }

        return sb.ToString();
    }

    static string GenerateInterface(Type type)
    {
        var sb = new StringBuilder();

        // Interface-Header mit JSDoc-Kommentar
        sb.AppendLine($"/**");
        sb.AppendLine($" * {type.Name}");
        sb.AppendLine($" * C# Type: {type.FullName}");
        sb.AppendLine($" */");
        sb.AppendLine($"export interface {type.Name} {{");

        // Properties
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .OrderBy(p => p.Name)
            .ToList();

        foreach (var prop in properties)
        {
            var tsType = ConvertToTypeScript(prop.PropertyType);
            var propName = ToCamelCase(prop.Name);
            var isOptional = IsNullable(prop.PropertyType) ? "?" : "";

            sb.AppendLine($"  {propName}{isOptional}: {tsType};");
        }

        sb.AppendLine("}");
        sb.AppendLine();

        return sb.ToString();
    }

    static string ConvertToTypeScript(Type csharpType)
    {
        // Nullable<T> → T | null
        var underlyingType = Nullable.GetUnderlyingType(csharpType);
        if (underlyingType != null)
        {
            return $"{ConvertToTypeScript(underlyingType)} | null";
        }

        // Referenztypen mit Nullable Reference Types → | null
        if (!csharpType.IsValueType && IsNullableReferenceType(csharpType))
        {
            return $"{ConvertNonNullableType(csharpType)} | null";
        }

        return ConvertNonNullableType(csharpType);
    }

    static string ConvertNonNullableType(Type type)
    {
        // Array oder List<T>
        if (type.IsArray)
        {
            var elementType = type.GetElementType()!;
            return $"{ConvertToTypeScript(elementType)}[]";
        }

        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(List<>))
        {
            var elementType = type.GetGenericArguments()[0];
            return $"{ConvertToTypeScript(elementType)}[]";
        }

        // Primitive Types
        if (type == typeof(string)) return "string";
        if (type == typeof(int) || type == typeof(long) || type == typeof(short) ||
            type == typeof(byte) || type == typeof(decimal) || type == typeof(double) ||
            type == typeof(float)) return "number";
        if (type == typeof(bool)) return "boolean";
        if (type == typeof(DateTime) || type == typeof(DateTimeOffset)) return "string"; // ISO 8601
        if (type == typeof(Guid)) return "string"; // UUID

        // Enums → union type
        if (type.IsEnum)
        {
            var enumValues = Enum.GetNames(type).Select(name => $"'{name}'");
            return string.Join(" | ", enumValues);
        }

        // Dictionary<string, T>
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Dictionary<,>))
        {
            var keyType = type.GetGenericArguments()[0];
            var valueType = type.GetGenericArguments()[1];
            if (keyType == typeof(string))
            {
                return $"{{ [key: string]: {ConvertToTypeScript(valueType)} }}";
            }
        }

        // Andere Complex Types → Interfacename (z.B. andere DTOs)
        if (type.IsClass || type.IsValueType)
        {
            return type.Name;
        }

        // Fallback
        return "any";
    }

    static bool IsNullable(Type type)
    {
        // Nullable<T> Value Types
        if (Nullable.GetUnderlyingType(type) != null)
            return true;

        // Reference Types mit Nullable Reference Types Annotation
        if (!type.IsValueType && IsNullableReferenceType(type))
            return true;

        return false;
    }

    static bool IsNullableReferenceType(Type type)
    {
        // Hinweis: In .NET 6+ kann NullabilityInfo API verwendet werden
        // Hier Vereinfachung: Wenn es ein Referenztyp ist, nehmen wir an es könnte null sein
        // (dies ist konservativ und erzeugt mehr | null Annotationen)
        // In Produktion würde man NullabilityInfoContext verwenden
        return !type.IsValueType;
    }

    static string ToCamelCase(string pascalCase)
    {
        if (string.IsNullOrEmpty(pascalCase))
            return pascalCase;

        return char.ToLowerInvariant(pascalCase[0]) + pascalCase.Substring(1);
    }
}
