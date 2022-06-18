{
  function extractList(list, index) {
    return list.map(function(element) { return element[index]; });
  }
  
  function buildList(head, tail, index) {
    return [head].concat(extractList(tail, index));
 }
}

start
    = (FnBlock / ClassMember / Hook / Constant / Enum / Class)*

DescriptionShared
    = 'Description:' _ desc:char+ { return desc.join(""); }
    
HookClass 
    = cls:(Identifier) _ "->" _ { return cls }
    
MemberClass
    = cls:(Identifier) separator:"." { return cls }
    
FnClass
    = cls:(Identifier) separator:"::" { return cls }

FnBlock
    = 'Function:' _ FnClass? Identifier ___
    'Signature:' _ ret:RetVal? _ cls:FnClass? method:Identifier '(' args:(ParamList)? ')' ___
    desc: DescriptionShared? ___
    {
        return {
        "block_type": "function",
        "method": method,
        "ret": ret,
        "class": cls,
        "args": args,
        "description": desc
      };
    }
    
ConstantValue
    = FloatValue
    / IntegerValue
    / VectorValue

FloatValue "float"
    = "-"? left:[0-9]+ "." right:[0-9]+ { return parseFloat(left.join("") + "." +   right.join("")); }

IntegerValue "integer"
     = "-"? digits:[0-9]+ { return parseInt(digits.join(""), 10); }

VectorValue "vector"
    = "Vector(" _ x:FloatValue _ "," _ y:FloatValue _ "," _ z:FloatValue _ ")" { return text(); }

Constant
    = 'Constant:' _ ("(" _ VarType _ ")")? _ from:(Identifier".")? id:Identifier ___
   'Value:' _ value:ConstantValue _ "(" type:VarType ")" ___
    desc: DescriptionShared? ___
    {
        return {
        "block_type": "constant",
        "name": id,
        "type": type,
        "value": value,
        "description": desc,
        "enum": from
      };
    }
    
ClassMember
    = 'Member:' _ MemberClass Identifier ___
    'Signature:' _ ret:VarType _ cls:MemberClass id:Identifier ___
    desc: DescriptionShared? ___ 
    {
        return {
            "block_type": "class_member",
            "name": id,
            "class": cls,
            "description" : desc
        }
    }
    
Hook
    = 'Hook:' _ HookClass  Identifier ___
    'Signature:'  _ ret:VarType _ cls:HookClass id:Identifier '(' args:(ParamList)? ')' ___
    desc: DescriptionShared? ___
    {
        return {
            "block_type": "hook",
            "name": id,
            "class": cls,
            "description": desc,
            "args": args
        }
    }
    

newline = '\n' / '\r' '\n'?
char = [^\n\r]
    
VarType
    = name:[a-zA-Z_<>]+ { return name.join("") } 
    
VarTypeAndName
    = type:VarType _ ("[" name:$(char+) "]")
    { return {
        "name": name,
        "type": type
        }
    }
    
Identifier
    = name:[a-zA-Z0-9_<>]+ { return name.join("") }
    
ParameterName =  "[" _ name:Identifier _ "]" { return name }

Parameter   
    = type:Identifier _ name:ParameterName? { 
    return { "type": type, "name": name } }
    
_ 'Whitespace'
    = [ \t\r]*
    
__ 'MandatoryWhitespace'
    = [ \t\r]+
    
___ 'NewLine'
    = [ \n]*

ParamList
  = head:Parameter tail:(_ "," _ Parameter)* {
      return buildList(head, tail, 3);
    }
    
Separator
    = '=====================================' ___
     
Enum
    = Separator
    'Enum:' _ id:Identifier ___
    'Elements:' _ count:IntegerValue ___
    desc: DescriptionShared? ___
    Separator
    {
        return {
            "block_type": "enum",
            "name": id,
            "size": count,
            "description": desc
        }
    }


Class 
    =
    Separator
    'Class:' _ id:Identifier ___
    'Base:' _ base:Identifier? ___
    desc: DescriptionShared? ___ 
    Separator
    {
        return {
            "block_type": "class",
            "class": id,
            "base": base,
            "description": desc
        }
    }
     
RetVal
    = type:VarType __ { return type }