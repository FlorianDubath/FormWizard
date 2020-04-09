<?php
function array_move_elem($array, $from, $to) {
    if ($from == $to) { return $array; }
    $c = count($array);
    if (($c > $from) and ($c > $to)) {
        if ($from < $to) {
            $f = $array[$from];
            for ($i = $from; $i < $to; $i++) {
                $array[$i] = $array[$i+1];
            }
            $array[$to] = $f;
        } else {
            $f = $array[$from];
            for ($i = $from; $i > $to; $i--) {
                $array[$i] = $array[$i-1];
            }
            $array[$to] = $f;
        }
    }
    return $array;
}

class FormWizardConfig {
    // property declaration
    public $storage_path = '';
    public $form_wizzard_object = '';
    
    // constructor
    function __construct($path) {
        $this->storage_path = $path;
        if (!file_exists($this->storage_path)){
            $default_text = '{
              "formWizardObject": {
                "title": "New",
                "description": "",
                "version": "0.0.1",
                "creation_date": "",
                "hide_wizzard_numbering": "true",
                "list":[],
                "section":[]
                }
            }';
            $defaultfile = fopen($this->storage_path, "w");
            fwrite($defaultfile, $default_text);
            fclose($defaultfile);
        }
        $string = file_get_contents($this->storage_path);
        $this->form_wizzard_object = json_decode($string, true);
        // Normalize object
        if (!isset($this->form_wizzard_object['formWizardObject']['list'])){
            $this->form_wizzard_object['formWizardObject']['list']=[];
        }
        if (!isset($this->form_wizzard_object['formWizardObject']['section'])){
            $this->form_wizzard_object['formWizardObject']['section']=[];
        }
    }
    
    
    // save change
    public function save() {
        foreach($this->form_wizzard_object['formWizardObject']['section'] as &$section){
            $section['field'] =  array_values($section['field']);
        }
    
        $string_content =  json_encode($this->form_wizzard_object);
        $storage_file = fopen($this->storage_path, "w");
        fwrite($storage_file, $string_content);
        fclose($storage_file);  
    }
    
    // Accessors
    public function getTitle() {
        return $this->form_wizzard_object['formWizardObject']['title'];
    }
    
    public function setTitle($new_title, $save = true) {
        $this->form_wizzard_object['formWizardObject']['title'] = $new_title;
        if ($save){
            $this->save();
        }
    }
    
    public function getHideNumber() {
        return $this->form_wizzard_object['formWizardObject']['hide_wizzard_numbering']=='true';
    }
    
    public function setHideNumber($do_hide, $save = true) {
        $this->form_wizzard_object['formWizardObject']['hide_wizzard_numbering'] = $do_hide?'true':'false';
        if ($save){
            $this->save();
        }
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////             LISTS                    //////////////////
    ////////////////////////////////////////////////////////////////////////
    public function &getListsRef() {
        return $this->form_wizzard_object['formWizardObject']['list'];
    }
    
    public function &getListRef($list_name) {
         foreach ($this->form_wizzard_object['formWizardObject']['list'] as &$list){
            if ($list['name']==$list_name){
                return $list;
            }
        } 
        $error = 'No list with name '.$list_name;
        throw new Exception($error);
    }
    
    public function isListUsed($list_name){
         $usage = 0;
         foreach ($this->form_wizzard_object['formWizardObject']['section'] as &$section){
            foreach($section['field'] as $field){
                if ($field['type']==$list_name){
                    $usage++;
                }
            }
         }
         return $usage;
    }
    
    private function renameListInFields($old_list_name, $new_list_name){
         foreach ($this->form_wizzard_object['formWizardObject']['section'] as &$section){
            foreach($section['field'] as &$field){
                if ($field['type']==$old_list_name){
                    $field['type']=$new_list_name;
                }
            }
         }
    }
    
    public function addList($list_name, $save = true){
        if ($list_name=='string' || $list_name=='text' || $list_name=='date'){
            $error = ' "string", "date" and "text" are reserved and cannot be used as a list name.';
            throw new Exception($error);
        }
        foreach ($this->form_wizzard_object['formWizardObject']['list'] as &$list){
            if ($list['name']==$list_name){
                $error = 'There is already a list with name '.$list_name;
                throw new Exception($error);
            }
        }
        
        $new_list = ["name"=> $list_name,"item"=> []];
        array_push($this->form_wizzard_object['formWizardObject']['list'], $new_list);
        if ($save){
            $this->save();
        }  
    }
    
    public function renameList($old_list_name, $new_list_name, $save = true){
        if ($new_list_name=='string' || $new_list_name=='text' || $new_list_name=='date'){
            $error = ' "string", "date" and "text" are reserved and cannot be used as a list name.';
            throw new Exception($error);
        }
    
        foreach ($this->form_wizzard_object['formWizardObject']['list'] as &$list){
            if ($list['name']==$old_list_name){
                $this->renameListInFields($old_list_name, $new_list_name);
                $list['name'] = $new_list_name;
                if ($save){
                    $this->save();
                }
                return; 
            }
        }
        $error = 'There is no list with name '.$old_list_name;
        throw new Exception($error);  
    }
    
    public function deleteList($list_name, $save = true){
        foreach ($this->form_wizzard_object['formWizardObject']['list'] as &$list){
            if ($list['name']==$list_name){
                $usages = isListUsed($list_name);
                if ($usages>0){
                    $error = 'The List '.$list_name.' is used in '.$usages.' fields and cannot be deleted';
                    throw new Exception($error);
                }
                unset($this->form_wizzard_object['formWizardObject']['list'][$list_name]);
                if ($save){
                    $this->save();
                }
                return; 
            }
        }
        $error = 'There is no list with name '.$list_name;
        throw new Exception($error);  
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////            LIST ITEMS                //////////////////
    ////////////////////////////////////////////////////////////////////////
    public function &getListItemsRef($list_name){
        $list_ref = $this->getListRef($list_name);
        return  $list_ref['item'];      
    }
    
    public function addListItem($list_name, $new_item_name, $save = true){
        $list_ref = &$this->getListRef($list_name);
        foreach ($list_ref['item'] as $existing_item){
            if ($existing_item == $new_item_name){
                $error = 'An item with name '.$new_item_name.' already exists in list'.$list_name;
                throw new Exception($error);
            }
        } 
        array_push($list_ref['item'], $new_item_name);
        if ($save){
            $this->save();
        }     
    }
    
    public function deleteListItem($list_name, $item_name, $save = true){
        $list_ref = &$this->getListRef($list_name);
        foreach ($list_ref['item'] as $existing_item){
            if ($existing_item == $item_name){
                $key = array_search($item_name, $list_ref['item']); 
                unset($list_ref['item'][$key]);
                if ($save){
                    $this->save();
                }
                return;
            }
        } 
        $error = 'No item with name '.$item_name.' found in list'.$list_name;
        throw new Exception($error);
    }
    
    public function riseListItem($list_name, $item_name, $save = true){
        $list_ref = &$this->getListRef($list_name);
        $index=0;
        foreach ($list_ref['item'] as $existing_item){
            if ($existing_item == $item_name){
                if ($index>0){
                    $list_ref['item'] = array_move_elem($list_ref['item'],$index, $index-1);
                    if ($save){
                        $this->save();
                    }
                }
                return;
            }
            $index++;
        } 
        $error = 'No item with name '.$item_name.' found in list'.$list_name;
        throw new Exception($error);
    }
    
    public function lowerListItem($list_name, $item_name, $save = true){
        $list_ref = &$this->getListRef($list_name);
        $index=0;
        foreach ($list_ref['item'] as $existing_item){
            if ($existing_item == $item_name){
                if ($index<sizeof($list_ref['item'])-1){
                    $list_ref['item'] = array_move_elem($list_ref['item'],$index, $index+1);
                    if ($save){
                        $this->save();
                    }
                }
                return;
            }
            $index++;
        } 
        $error = 'No item with name '.$item_name.' found in list'.$list_name;
        throw new Exception($error);
    }
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////             SECTIONS                 //////////////////
    ////////////////////////////////////////////////////////////////////////
    public function &getSectionsRef(){
        return $this->form_wizzard_object['formWizardObject']['section'];
    }
    
    public function addSection($new_section_title, $new_section_description, $image='', $save = true){
        $sections_ref = &$this->getSectionsRef();
        $obj = ["title"=>$new_section_title, "description"=>$new_section_description, "field"=>[]];
        if ($image!=''){
             $obj['image']=  $image;
        }
        array_push($sections_ref, $obj);
        if ($save){
            $this->save();
        }     
    }
    
    public function updateSection($section_index, $new_section_title, $new_section_description, $image='', $save = true){
        $sections_ref = &$this->getSectionsRef();
        $sections_ref[$section_index]["title"]=$new_section_title;
        $sections_ref[$section_index]["description"]=$new_section_description;
        if ($image!=''){
            $sections_ref[$section_index]['image']=  $image;
        } else {
            unset($sections_ref[$section_index]['image']);
        }
        if ($save){
            $this->save();
        } 
    }
    
    public function deleteSection($section_index, $save = true){
        $sections_ref = &$this->getSectionsRef();
        unset($sections_ref[$section_index]);
        if ($save){
            $this->save();
        } 
    }
    
    public function riseSection($section_index, $save = true){
        $sections_ref = &$this->getSectionsRef();
        if ($section_index>0){
            $sections_ref = array_move_elem($sections_ref,$section_index, $section_index-1);
              if ($save){
                   $this->save();
              }
        }
        
     }
     
     public function lowerSection($section_index, $save = true){
        $sections_ref = &$this->getSectionsRef();
        if ($section_index<sizeof($sections_ref)-1){
            $sections_ref = array_move_elem($sections_ref,$section_index, $section_index+1);
              if ($save){
                   $this->save();
              }
        }
        
     }    
    
    
    ////////////////////////////////////////////////////////////////////////
    ////////////////             QUESTIONS                //////////////////
    ////////////////////////////////////////////////////////////////////////
    public function &getQuestionsRef($section){
        return $this->form_wizzard_object['formWizardObject']['section'][$section]['field'];
    }
    
    public function addQuestion($section, $new_text, $new_type, $mandatory="True", $list_as_rb='true', $save = true){
        $questions_ref = &$this->getQuestionsRef($section);
        $question =  ["label"=>$new_text, "type"=>$new_type, "mandatory"=>$mandatory];
        if (!in_array($new_type, ['string','text','date'])){
            if (strtolower($list_as_rb)=='true'){ 
                $question['rb']='true';
            }
        }
        $questions_ref[] = $question;
        if ($save){
            $this->save();
        }     
    }
    
    public function updateQuestion($section, $question, $new_text, $new_type, $mandatory="True", $list_as_rb='true', $save = true){
        $questions_ref = &$this->getQuestionsRef($section);
        $questions_ref[$question]['label'] = $new_text;
        $questions_ref[$question]['type'] = $new_type;
        $questions_ref[$question]['mandatory'] = $mandatory;
        
        if (!in_array($new_type, ['string','text','date'])){
            if (strtolower($list_as_rb)=='true'){ 
                $questions_ref[$question]['rb'] ='true';
            } else {
                unset( $questions_ref[$question]['rb']);
            }
        }
        
        if ($save){
            $this->save();
        }     
    }
    
    public function deleteQuestion($section, $question, $save = true){
        $questions_ref = &$this->getQuestionsRef($section);
        unset($questions_ref[$question]);
        if ($save){
            $this->save();
        } 
    }
    
    public function riseQuestion($section, $question, $save = true){
        $questions_ref = &$this->getQuestionsRef($section);
        if ($question>0){
            $questions_ref = array_move_elem($questions_ref,$question, $question-1);
              if ($save){
                   $this->save();
              }
        }
     }
     
    public function lowerQuestion($section, $question, $save = true){
        $questions_ref = &$this->getQuestionsRef($section);
        if ($question<sizeof($questions_ref)-1){
            $questions_ref = array_move_elem($questions_ref,$question, $question+1);
              if ($save){
                   $this->save();
              }
        }
     }
}
?>      
