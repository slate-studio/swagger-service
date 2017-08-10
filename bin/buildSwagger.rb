#!/usr/bin/env ruby

def add_tab(fileContent)
  fileContent = "  #{fileContent}"
  fileContent = fileContent.gsub("\n ", "\n   ")
  fileContent
end

def group_paths_by_url(paths)
  actions = []
  paths.each do |path|
    f = File.open(path, 'r')
    content    = ''
    controller = ''
    url        = ''
    i = 1
    f.each_line do |line|
      if i == 1
        url = line
      elsif i == 2
        controller = line
      else
        content += line
      end
      i += 1
    end
    f.close
    action = { url: url, controller: controller, content: content }
    actions.push(action)
  end
  actions = actions.group_by { |a| a[:url] }
  actions
end

header       = File.read('./api/swagger/src/header.yaml')
swagger_path = File.read('./api/swagger/src/paths/swagger.yaml')
files        = Dir['./api/swagger/src/**/*.yaml']
definitions  = files.select { |f| f.include?('/definitions') }

paths = files - definitions
paths = paths.select { |f| !f.include?('/header.yaml') && !f.include?('/paths/swagger.yaml') }

actions = group_paths_by_url(paths)

swagger_spec = File.new('./api/swagger/swagger.yaml', 'w+')
File.open(swagger_spec, 'a') do |file|
  file.puts header
  file.puts 'paths:'
  file.puts swagger_path

  actions.each do |path, actions|
    file.puts add_tab(path)
    file.puts add_tab(actions[0][:controller])

    actions.each do |action|
      file.puts add_tab(action[:content])
    end
  end

  file.puts 'definitions:'

  definitions.each do |definition|
    definitionSpec = File.read(definition)
    definitionSpec = add_tab(definitionSpec)
    file.puts definitionSpec
  end
end
